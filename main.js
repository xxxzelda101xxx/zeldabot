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
import { listener, shigeapiClient } from "./utils/apiclient.js"
import { Events, Kient } from 'kient'
import config from "./config.json" assert { type: "json" };
const userId = "37575275"
var channels

async function main() {
	await getChannelDataAndSaveToDB(config.twitch.channels)
	channels = await getChannels()
	startWebsocket()
	startSevenTVWebsocket(channels)
	chatClient.connect()
	listener.start()
	if (config.twitch.is_official_bot) {
		listener.onChannelRedemptionAddForReward(userId, "34f48b7d-25e1-4aeb-b622-39e63a9291d8", e => {
			logger.verbose(`${e.userName} used !blame3!`)
		})
		streamOnlineEvents(userId)
		streamOfflineEvents(userId)
		streamBanEvents(userId)
	}
	if (config.kick.enabled) {
		const client = await Kient.create()
		const channel = await client.api.channel.getChannel('shigetora')
		await channel.connectToChatroom()
		await client.api.authentication.login({
			email: config.kick.email, // mail@example.com
			password: config.kick.password, // qwerty123
			otc: config.kick.otc // one-time code provided via TOTP or Email
		})
		//await client.api.chat.sendMessage(channel.data.chatroom.id, 'test')
		client.on(Events.Chatroom.Message, (messageInstance) => {
			const message = messageInstance.data
			//console.log(message)
			//console.log(`${message.sender.username}: ${message.content}`)
			kickMessageHandler(client, message.sender.username, message.content, messageInstance, osuData)
		})
	}
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