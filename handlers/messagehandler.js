import { setCooldown, getCooldown } from "../helpers/cooldownhelper.js"
import { addToDB, addEmoteToDB, getTwitchStreamStatus, addTwitchUserToDB, getWhitelistStatus } from "../database.js"
import { kagamiBanRNG, banRNG, deleteMessage } from "../functions.js"
import { logger } from "../logger.js"
import { GosuMemory } from "../classes/gosumemory.js"
import { chatClient } from "../utils/chatclient.js"
import * as Commands from "../commands/index.js";
import config from "../config.json" assert { type: "json" }
const osuCommandsOnly = config.twitch.osu_commands_only
const isWhitelistEnabled = config.twitch.enable_whitelist
const admins = config.twitch.admins
import { apiClient } from "../utils/apiclient.js"


async function messageHandler(channel, user, msg, context, osuData) {
	if (Object.keys(osuData).length != 0) osuData = new GosuMemory(osuData)
	else osuData = null
	msg = msg.trim()
	const user_id = context.userInfo.userId
	const channel_id = context.channelId
	const command = msg.substring(1).trim().toLowerCase().split(" ")[0]
	var commandToRun
	if (msg.startsWith("!")) {
		commandToRun = Commands[command]
	}
	if (channel) {
		addTwitchUserToDB(user_id, user)
		addToDB(user_id, channel_id)
		addEmoteToDB(user_id, msg, context.parseEmotes(), channel_id)
		if (config.twitch.is_official_bot) {
			if (channel != "#shigetora" && channel != "#zelda101_" && channel != "#frenz396" && channel != "#ufrjd" && channel != "#metalproz") return
			if (user.toLowerCase() == "kagami_77") kagamiBanRNG(channel, user, user_id, context) // 1/1k chance to ban kagami
			banRNG(channel, user, user_id, context) // 1/10k chance to ban anyone
		}
		if (!commandToRun) return
		const canUserUseCommand = await canRunCommand(commandToRun, user, osuData, context)
		if (!canUserUseCommand && admins.indexOf(user.toLowerCase()) < 0) return await deleteMessage(channel_id, config.twitch.moderator_id, context.id)
		if (!osuData && commandToRun.isOsuCommand == true) return
		logger.verbose(`Executing !${commandToRun.name} from user: ${user} in channel: ${channel}.`)
		let args = msg.slice(1).split(' ')
		if (commandToRun.isOsuCommand) await runOsuCommand(commandToRun, channel, msg, context, osuData, args)
		else await runCommand(commandToRun, channel, msg, context, args)
}
	else {
		if (!commandToRun || commandToRun.adminOnly || commandToRun.modOnly) return
		if (commandToRun.canWhisper) {
			logger.verbose(`Executing !${commandToRun.name} from user: ${user} in whispers.`)
			let args = msg.slice(1).split(' ')
			if (commandToRun.isOsuCommand) await runOsuCommand(commandToRun, null, msg, context, osuData, args)
			else await runCommand(commandToRun, null, msg, context, args)
		}
	}
}

async function canRunCommand(commandToRun, user, osuData, context) {
	const user_id = context.userInfo.userId
	const channel_id = context.channelId
	const isMod = (context.userInfo.isMod || context.userInfo.isBroadcaster) ? true : false
	const whitelistStatus = await getWhitelistStatus(user_id)
	if (commandToRun.adminOnly && admins.indexOf(user.toLowerCase()) < 0) return false
	if (commandToRun.modOnly && !isMod) return false
	if (osuCommandsOnly && !commandToRun.isOsuCommand && !commandToRun.adminOnly) return false
	if (!osuData && commandToRun.isOsuCommand == true) return false
	var online = await getTwitchStreamStatus(channel_id)
	const cooldown = getCooldown(commandToRun)
	if (!isMod && online) {
		if (commandToRun.offlineOnly) return false //Delete message if stream is live and command can only be used while stream is offline
		if (cooldown && !isMod) return false //Delete message is command is on cooldown and the user isn't a mod
		if (isWhitelistEnabled && !whitelistStatus && !commandToRun.isPublic) return false //Delete message if an unwhitelisted user tried to use a whitelist only command
		if (osuData && commandToRun.requiredState && osuData.menuState != commandToRun.requiredState) return false
	}
	setCooldown(commandToRun)
	return true
}

async function runCommand(command, channel, msg, context, args) {
	try {
		var messageToSend = await command.execute(msg, context, args)
		if (channel) chatClient.say(channel, messageToSend)
		else apiClient.whispers.sendWhisper(config.twitch.moderator_id, user_id, messageToSend)
	}
	catch (e) {
		logger.error(`Command ${command.name} Failed: ${e}`)
		console.log(e)
		chatClient.say(channel, e.toString(), { replyTo: context })
	}
}
async function runOsuCommand(command, channel, msg, context, osuData, args) {
	try {
		var messageToSend = await command.execute(msg, context, osuData, args)
		if (channel) chatClient.say(channel, messageToSend)
		else apiClient.whispers.sendWhisper(config.twitch.moderator_id, user_id, messageToSend)
	}
	catch (e) {
		logger.error(`Command ${command.name} Failed: ${e}`)
		chatClient.say(channel, e.toString())
	}
}

const _messageHandler = messageHandler
export { _messageHandler as messageHandler }
