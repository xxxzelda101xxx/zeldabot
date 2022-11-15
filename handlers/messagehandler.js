exports.messageHandler = messageHandler
const { setCooldown, getCooldown } = require("../helpers/cooldownhelper.js")
const { addToDB, addEmoteToDB, getTwitchStreamStatus, addTwitchUserToDB, getWhitelistStatus } = require("../database.js")
const { kagamiBanRNG, banRNG } = require("../functions.js")
const { logger } = require("../logger.js")
const { Commands } = require("../helpers/commandshelper.js")
const { GosuMemory } = require("../classes/gosumemory.js")
const { chatClient } = require("../utils/chatclient.js")
const config = require("../config.json")
const isWhitelistEnabled = config.twitch.enable_whitelist
const admins = config.twitch.admins

async function messageHandler(channel, user, msg, context, osuData) {
	if (Object.keys(osuData).length != 0) osuData = new GosuMemory(osuData)
	else osuData = null
	msg = msg.trim()
	const user_id = context.userInfo.userId
	const channel_id = context.channelId
	const command = msg.trim().toLowerCase().split(" ")[0]
	const commandToRun = Commands[command]
	const isMod = (context.userInfo.isMod || context.userInfo.isBroadcaster) ? true : false
	const whitelistStatus = await getWhitelistStatus(user_id)
	if (commandToRun) {
		if (commandToRun.adminOnly && admins.indexOf(user) < 0) return
		if (commandToRun.modOnly && !isMod) return
	}
	if (channel) {
		if (user.toLowerCase() == "kagami_77") kagamiBanRNG(channel, user)
		banRNG(channel, user, context)
		addTwitchUserToDB(user_id, user)
		addToDB(user_id, channel_id)
		addEmoteToDB(user_id, msg, context.parseEmotes(), channel_id)
		if (!commandToRun) return
		if (!osuData && commandToRun.isOsuCommand == true) return
		var online = await getTwitchStreamStatus(channel_id)
		const cooldown = getCooldown(command)
		if (!isMod && online) {
			if (commandToRun.offlineOnly) return chatClient.deleteMessage(channel, context)
			if (cooldown && !isMod) return chatClient.deleteMessage(channel, context)
			if (isWhitelistEnabled && !whitelistStatus && !commandToRun.isPublic) return chatClient.deleteMessage(channel, context)
			if (osuData && commandToRun.requiredState && osuData.menuState != commandToRun.requiredState) return chatClient.deleteMessage(channel, context)
		}
		setCooldown(command)
		logger.debug(`Executing !${commandToRun.name} from user: ${user} in channel: ${channel}.`)
		let messageToSend = await commandToRun.execute(channel, user, msg, context, chatClient, osuData)
		chatClient.say(channel, messageToSend)
	}
	else {
		if (!commandToRun) return
		if (commandToRun.adminOnly) return
		if (commandToRun.modOnly) return
		logger.debug(`Executing !${commandToRun.name} from user: ${user} in whispers.`)
		if (commandToRun.canWhisper) {
			let messageToSend = await commandToRun.execute(channel, user, msg, context, chatClient, osuData)
			chatClient.whisper(user, messageToSend)
		}
	}
}

exports.messageHandler = messageHandler