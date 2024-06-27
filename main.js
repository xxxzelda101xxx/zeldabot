import { startWebsocket } from "./websocket.js"
import { startSevenTVWebsocket } from "./seventvwebsocket.js"
import { addAllSevenTVEmotesToDB, getChannelDataAndSaveToDB } from "./functions.js"
import { messageHandler, kickMessageHandler } from "./handlers/messagehandler.js"
import { subHandler } from "./handlers/subhandler.js"
import { banHandler } from "./handlers/banhandler.js"
import { getChannels, changeTwitchStreamStatus } from "./database.js"
import { logger } from "./logger.js"
import { chatClient } from "./utils/chatclient.js"
import { osuData } from "./websocket.js"
import { listener } from "./utils/apiclient.js"
import config from "./config.json" assert { type: "json" };

async function main() {
	await getChannelDataAndSaveToDB(config.twitch.channels)
	var channels = await getChannels()
	startWebsocket()
	startSevenTVWebsocket(channels)
	chatClient.connect()
	listener.start()
	for (var i = 0; i < channels.length; i++) {
		addAllSevenTVEmotesToDB(channels[i].channel_id)
	}
	chatClient.onConnect(() => {
		logger.info("Connected to Twitch Chat.")
	})
	chatClient.onDisconnect(() => {
		logger.warn("Disconnected from Twitch Chat.")
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
	listener.onStreamOnline(channel_id, e => {
		logger.verbose(`${e.broadcasterName} is live!`)
		changeTwitchStreamStatus(e.broadcasterId, true)
	})
}

function streamOfflineEvents(channel_id) {
	listener.onStreamOffline(channel_id, e => {
		logger.verbose(`${e.broadcasterName} is offline.`)
		changeTwitchStreamStatus(e.broadcasterId, false)
	})
}

function streamBanEvents(channel_id) {
	listener.onChannelBan(channel_id, e => {
		if (e.reason == "!blame3") {
			chatClient.say("#shigetora", `${e.userName} was banned.`)
		}
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