const fs = require("fs")
const { logger } = require("./logger.js")


if (!fs.existsSync("./config.json")) {
	firstRun()
}
else {
	const { changeTwitchStreamStatus } = require("./database.js")
	//main()
}

async function main() {
	const { getChannels } = require("./database.js")
	const { startWebsocket } = require("./websocket.js")
	const { startSevenTVWebsocket } = require("./seventvwebsocket.js")
	const { messageHandler } = require("./handlers/messagehandler.js")
	const { subHandler } = require("./handlers/subhandler.js")
	const { banHandler } = require("./handlers/banhandler.js")
	var config = require("./config.json")
	const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken
	const { chatClient } = require("./utils/chatclient.js")
	var { osuData } = require("./websocket.js")
	const { listener } = require("./utils/apiclient.js")
	const userId = "37575275"
	var channels = await getChannels()
	startWebsocket()
	startSevenTVWebsocket(channels)
	await chatClient.connect()
	chatClient.onRegister(() => {
		logger.info("Connected to Twitch!")
	})
	if (useSeparateBroadcasterToken) {
		await listener.start()
		listener.subscribeToChannelRedemptionAddEventsForReward(userId, "34f48b7d-25e1-4aeb-b622-39e63a9291d8", e => {
			logger.verbose(`${e.userName} used !blame3!`)
			chatClient.say("#shigetora", "!blame3")
		})
		for (var i = 0; i < channels.length; i++) {
			streamOnlineEvents(channels[i].channel_id)
			streamOfflineEvents(channels[i].channel_id)
		}
	}
	chatClient.onSubExtend(async function (channel, user, subInfo, context){
		subHandler(channel, user, subInfo, context)
	})
	chatClient.onSubGift(async function (channel, user, subInfo, context){
		subHandler(channel, user, subInfo, context)
	})
	chatClient.onResub(async function (channel, user, subInfo, context){
		subHandler(channel, user, subInfo, context)
	})
	chatClient.onBan(async function (channel, user, msg) {
		banHandler(channel, user, msg)
	})
	chatClient.onMessage(async function (channel, user, msg, context) {
		messageHandler(channel, user, msg, context, osuData)
	})
	chatClient.onWhisper(async function (user, msg, context) {
		messageHandler(null, user, msg, context, osuData)
	})
	chatClient.onDisconnect(async function (manually, reason) {
		console.log(reason)
	})
}

async function firstRun () {
	fs.renameSync("./config.example.json", "./config.json", function (err) {})
	logger.info("Moved tokens.example.json to tokens.json.")
	fs.renameSync("./tokens.example.json", "./tokens.json", function (err) {})
	logger.info("Moved config.example.json to config.json.")
	const sqlite3 = require("sqlite3").verbose()
	const db = new sqlite3.Database("database.db")

	db.run("CREATE TABLE IF NOT EXISTS `channels` (`name` varchar(32) NOT NULL, `channel_id` integer NOT NULL, `seventv_channel_id` varchar(24) DEFAULT NULL, `online` integer NOT NULL)")
	db.run("CREATE TABLE IF NOT EXISTS `emotes` (`user_id` integer NOT NULL,  `channel_id` integer NOT NULL, `emote` varchar(100) NOT NULL, `uses` integer NOT NULL, UNIQUE (`user_id`,`emote`,`channel_id`))")
	db.run("CREATE TABLE IF NOT EXISTS `seventvemotes` (`channel_id` integer NOT NULL, emote_name text NOT NULL, emote_id integer NOT NULL, UNIQUE (`channel_id`,`emote_id`))")
	db.run("CREATE TABLE IF NOT EXISTS `messages` (`user_id` integer NOT NULL, `channel_id` integer NOT NULL, `total` integer NOT NULL, UNIQUE (`user_id`,`channel_id`))")
	db.run("CREATE TABLE IF NOT EXISTS `users` (`user_id` integer NOT NULL, `username` varchar(25) NOT NULL, `whitelisted` BOOLEAN NOT NULL DEFAULT 0, UNIQUE (`user_id`))")
	db.run("CREATE TABLE IF NOT EXISTS `bans` (`user_id` integer NOT NULL, `channel_id` integer NOT NULL, `bans` integer NOT NULL DEFAULT 0, UNIQUE (`user_id`,`channel_id`))")
	
	logger.info("Created Database.")
	logger.info("Please edit your new config.json file.")
	process.exit(1)
}

function streamOnlineEvents(channel_id) {
	listener.subscribeToStreamOnlineEvents(channel_id, e => {
		logger.verbose(`${e.broadcasterName} is live!`)
		changeTwitchStreamStatus(e.broadcasterId, true)
	})
}

function streamOfflineEvents(channel_id) {
	listener.subscribeToStreamOfflineEvents(channel_id, e => {
		logger.verbose(`${e.broadcasterName} is offline.`)
		changeTwitchStreamStatus(e.broadcasterId, false)
	})
}

process
	.on("unhandledRejection", (reason, p) => {
		console.error(reason, "Unhandled Rejection at Promise", p)
	})
	.on("uncaughtException", err => {
		console.error(err, "Uncaught Exception thrown")
		process.exit(1)
	})