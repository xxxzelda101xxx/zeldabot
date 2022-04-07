const config = require("./config.json")
const { isStreamOnline } = require("./functions.js")
const { messageHandler } = require("./handlers/messagehandler.js")
const { subHandler } = require("./handlers/subhandler.js")
const { banHandler } = require("./handlers/banhandler.js")
const { logger } = require("./logger.js")
const { chatClient } = require("./utils/chatclient.js")
const { mapTrackingLoop } = require("./loops/maptrackingloop.js")
const { shigeapiClient } = require("./utils/apiclient")

async function main() {
	var info = await shigeapiClient.getTokenInfo()
	console.log(info.scopes)
	mapTrackingLoop()
	await chatClient.connect()
	chatClient.onRegister(() => {
		logger.info("Connected to Twitch!")
		for (var i = 0; i < config.twitch.channels.length; i++) {
			isStreamOnline(config.twitch.channels[i], true)
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