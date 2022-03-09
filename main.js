const config = require("./config.json")
const { isStreamOnline, shigeMapTracking, startReplaySaveLoop } = require("./functions.js")
const { messageHandler } = require("./handlers/messagehandler.js")
const { subHandler } = require("./handlers/subhandler.js")
const { banHandler } = require("./handlers/banhandler.js")
const { logger } = require("./logger.js")
const { chatClient } = require("./utils/chatclient.js")

async function main() {
	startReplaySaveLoop()
	await chatClient.connect()
	chatClient.onRegister(() => {
		logger.info("Connected to Twitch!")
		shigeMapTracking()
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

process.on('uncaughtException', function(err) {
	logger.error('Caught exception: ' + err);
  });