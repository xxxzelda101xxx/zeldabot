exports.messageHandler = messageHandler
const { setCooldown, getCooldown } = require("../helpers/cooldownhelper.js")
const { addToDB, addEmoteToDB, getTwitchStreamStatus, addTwitchUserToDB, getWhitelistStatus } = require("../database.js")
const { kagamiBanRNG, banRNG } = require("../functions.js")
const { logger } = require("../logger.js")
const { Commands } = require("../helpers/commandshelper.js")
const { GosuMemory } = require("../classes/gosumemory.js")
const { chatClient } = require("../utils/chatclient.js")
const config = require("../config.json")
const osuCommandsOnly = config.twitch.osu_commands_only
const isWhitelistEnabled = config.twitch.enable_whitelist
const admins = config.twitch.admins
const { apiClient } = require("../utils/apiclient")


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
		addTwitchUserToDB(user_id, user)
		addToDB(user_id, channel_id)
		addEmoteToDB(user_id, msg, context.parseEmotes(), channel_id)
		if (channel != "#shigetora" && channel != "#zelda101_") return
		if (user.toLowerCase() == "kagami_77") kagamiBanRNG(channel, user)
		banRNG(channel, user, context)
		if (!commandToRun) return
		if (osuCommandsOnly && commandToRun.isOsuCommand == true) return
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
		logger.verbose(`Executing !${commandToRun.name} from user: ${user} in channel: ${channel}.`)
		try {
			let messageToSend = await commandToRun.execute(msg, context, osuData)
			console.log(messageToSend)
			if (messageToSend != "") {
				chatClient.say(channel, messageToSend)
			}
		}
		catch (e) {
			logger.error(`Command ${command} Failed: ${e}`)
			chatClient.say(channel, e, { replyTo: context })
		}
	}
	else {
		if (!commandToRun) return
		if (commandToRun.adminOnly) return
		if (commandToRun.modOnly) return
		logger.verbose(`Executing !${commandToRun.name} from user: ${user} in whispers.`)
		if (commandToRun.canWhisper) {
			try {
				let messageToSend = await commandToRun.execute(msg, context, osuData)
				if (messageToSend != "") await apiClient.whispers.sendWhisper("14163149", user_id, messageToSend)
			}
			catch (e) {
				logger.error(`Command ${command} Failed: ${e}`)
			}
		}
	}
}

exports.messageHandler = messageHandler