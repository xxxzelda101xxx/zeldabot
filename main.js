const config = require("./config.json")
const { startWebsocket } = require("./websocket.js")
const { start7TVWebsocket } = require("./7tvwebsocket.js")
const { messageHandler } = require("./handlers/messagehandler.js")
const { subHandler } = require("./handlers/subhandler.js")
const { banHandler } = require("./handlers/banhandler.js")
const { getChannels } = require("./database.js")
const { get7TVUserIDFromTwitchUserID } = require("./functions.js")
const { logger } = require("./logger.js")
const { chatClient } = require("./utils/chatclient.js")
var { osuData } = require("./websocket.js")
const { listener } = require("./utils/apiclient.js")
const userId = "37575275"

async function main() {
	const channels = await getChannels()
	var test = await get7TVUserIDFromTwitchUserID(userId)
	console.log(test)
	startWebsocket()
	//start7TVWebsocket(channels)
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
		listener.subscribeToStreamOnlineEvents(channels[i], e => {
			console.log(e)
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