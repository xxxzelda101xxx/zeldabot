const config = require("./config.json")
const { startWebsocket } = require("./websocket.js")
const channels = config.twitch.channels
const { isStreamOnline } = require("./functions.js")
const { messageHandler } = require("./handlers/messagehandler.js")
const { subHandler } = require("./handlers/subhandler.js")
const { banHandler } = require("./handlers/banhandler.js")
const { logger } = require("./logger.js")
const { chatClient } = require("./utils/chatclient.js")
var { osuData } = require("./websocket.js")
const { shigeapiClient, listener } = require("./utils/apiclient.js")
const userId = '37575275';

async function main() {
	startWebsocket()
	await chatClient.connect()
	await listener.start();
	chatClient.onRegister(() => {
		logger.info("Connected to Twitch!")
		logger.verbose("Connected to: " + JSON.stringify(channels))
		for (var i = 0; i < channels.length; i++) {
			isStreamOnline(channels[i], true)
		}
	})
	//await shigeapiClient.channelPoints.deleteCustomReward(userId, "1222fecb-5589-4b2a-950d-354e3d0805e1")
	//const rewards = await shigeapiClient.channelPoints.getCustomRewards('37575275');
	//for (i = 0; i < rewards.length; i++) console.log(rewards[i].title + " " + rewards[i].id)
	const onlineSubscription = await listener.subscribeToChannelRedemptionAddEventsForReward(userId, "34f48b7d-25e1-4aeb-b622-39e63a9291d8", e => {
		console.log(`${e.userName} used !blame3!`);
		chatClient.say("#shigetora", "!blame3")
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