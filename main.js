const { startWebsocket } = require("./websocket.js")
const { startSevenTVWebsocket } = require("./seventvwebsocket.js")
const { messageHandler } = require("./handlers/messagehandler.js")
const { subHandler } = require("./handlers/subhandler.js")
const { banHandler } = require("./handlers/banhandler.js")
const { getChannels, changeTwitchStreamStatus } = require("./database.js")
const { logger } = require("./logger.js")
const { chatClient } = require("./utils/chatclient.js")
var { osuData } = require("./websocket.js")
const { listener } = require("./utils/apiclient.js")
const userId = "37575275"
var channels

async function main() {
	channels = await getChannels()
	console.log(channels[3].channel_id)
	startWebsocket()
	startSevenTVWebsocket(channels)
	await chatClient.connect()
	await listener.start()
	chatClient.onRegister(() => {
		logger.info("Connected to Twitch!")
	})
	listener.subscribeToChannelRedemptionAddEventsForReward(userId, "34f48b7d-25e1-4aeb-b622-39e63a9291d8", e => {
		console.log(`${e.userName} used !blame3!`)
		chatClient.say("#shigetora", "!blame3")
	})
	for (var i = 0; i < channels.length; i++) {
		listener.subscribeToStreamOnlineEvents(channels[i].channel_id, e => {
			logger.verbose(`${e.broadcasterName} is live!`)
			changeTwitchStreamStatus(e.broadcasterId, true)
		})
		listener.subscribeToStreamOfflineEvents(channels[i].channel_id, e => {
			logger.verbose(`${e.broadcasterName} is offline.`)
			changeTwitchStreamStatus(e.broadcasterId, false)
		})
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

main()

process
	.on("unhandledRejection", (reason, p) => {
		console.error(reason, "Unhandled Rejection at Promise", p)
	})
	.on("uncaughtException", err => {
		console.error(err, "Uncaught Exception thrown")
		process.exit(1)
	})