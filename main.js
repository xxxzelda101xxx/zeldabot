const { startWebsocket } = require("./websocket.js")
const { startSevenTVWebsocket } = require("./seventvwebsocket.js")
const { addAllSevenTVEmotesToDB, getChannelDataAndSaveToDB } = require("./functions.js")
const { messageHandler } = require("./handlers/messagehandler.js")
const { subHandler } = require("./handlers/subhandler.js")
const { banHandler } = require("./handlers/banhandler.js")
const { getChannels, changeTwitchStreamStatus } = require("./database.js")
const { logger } = require("./logger.js")
const { chatClient } = require("./utils/chatclient.js")
var { osuData } = require("./websocket.js")
const { listener, shigeapiClient } = require("./utils/apiclient.js")
const config = require("./config.json")
const userId = "37575275"
var channels

async function main() {
	await getChannelDataAndSaveToDB(config.twitch.channels)
	channels = await getChannels()
	startWebsocket()
	startSevenTVWebsocket(channels)
	await chatClient.connect()
	await listener.start()
	if (config.twitch.is_official_bot) {
		var subs = await shigeapiClient.eventSub.getSubscriptions()
		console.log(subs.data[0].id)
		for (var i = 0; i < subs.data.length; i++) {
			await shigeapiClient.eventSub.deleteSubscription(subs.data[i].id)
		}
	}
	chatClient.onRegister(() => {
		logger.info("Connected to Twitch!")
	})
	if (config.twitch.is_official_bot) {
		listener.subscribeToChannelRedemptionAddEventsForReward(userId, "34f48b7d-25e1-4aeb-b622-39e63a9291d8", e => {
			logger.verbose(`${e.userName} used !blame3!`)
			chatClient.say("#shigetora", "!blame3")
		})
	}
	for (var i = 0; i < channels.length; i++) {
		if (config.twitch.is_official_bot) {
			streamOnlineEvents(channels[i].channel_id)
			streamOfflineEvents(channels[i].channel_id)
			//streamBanEvents(channels[i].channel_id)
		}
		addAllSevenTVEmotesToDB(channels[i].channel_id)
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

function streamBanEvents(channel_id) {
	listener.subscribeToChannelBanEvents(channel_id, e => {
		console.log(e.userName)
	})
}

main()

process
	.on("unhandledRejection", (reason, p) => {
		console.error(reason, "Unhandled Rejection at Promise", p)
	})
	.on("uncaughtException", err => {
		console.error(err, "Uncaught Exception thrown")
		process.exit(1)
	})