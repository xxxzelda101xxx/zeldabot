const { startWebsocket } = require("./websocket.js")
const { startSevenTVWebsocket } = require("./seventvwebsocket.js")
const { messageHandler } = require("./handlers/messagehandler.js")
const { subHandler } = require("./handlers/subhandler.js")
const { banHandler } = require("./handlers/banhandler.js")
const { getChannels, changeTwitchStreamStatus } = require("./database.js")
const { logger } = require("./logger.js")
const config = require("./config.json")
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken
const { chatClient } = require("./utils/chatclient.js")
var { osuData } = require("./websocket.js")
const { listener } = require("./utils/apiclient.js")
const userId = "37575275"
var channels
const fs = require("fs")

try {
	if (fs.existsSync("./config.json")) {
		main()
	}
} 
catch(err) {
fs.rename("./config.example.json", "./config.json", function (err) {
	console.log('Created config.json')
})
fs.rename("./tokens.example.json", "./tokens.json", function (err) {
	console.log('Created tokens.json')
})
}

async function main() {
	channels = await getChannels()
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