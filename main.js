const config = require("./config.json")
const { startWebsocket } = require("./websocket.js")
const channels = config.twitch.channels
const { isStreamOnline } = require("./functions.js")
const { messageHandler } = require("./handlers/messagehandler.js")
const { subHandler } = require("./handlers/subhandler.js")
const { banHandler } = require("./handlers/banhandler.js")
const { logger } = require("./logger.js")
const { chatClient } = require("./utils/chatclient.js")
const { startRouter } = require("./routes/index.js")
var { incrementMessages } = require("./routes/index.js")

async function main() {
	startWebsocket()
	await chatClient.connect()
	chatClient.onRegister(() => {
		startRouter()
		logger.info("Connected to Twitch!")
		for (var i = 0; i < channels.length; i++) {
			isStreamOnline(channels[i], true)
		}
	})
	chatClient.onSubExtend(async function (channel, user, subInfo, context){
		subHandler(channel, user, subInfo, context)
	})
	chatClient.onSubGift(async function (channel, user, subInfo, context){
		subHandler(channel, user, subInfo, context)
	})
	chatClient.onResub(async function (channel, user, subInfo, context){
		subHandler(channel, user, subInfo, context)
	})
	chatClient.onBan(async function (channel, user) {
		banHandler(channel, user)
	})
	chatClient.onMessage(async function (channel, user, msg, context) {
		incrementMessages()
		messageHandler(channel, user, msg, context)
	})
	chatClient.onWhisper(async function (user, msg, context) {
		messageHandler(null, user, msg, context)
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