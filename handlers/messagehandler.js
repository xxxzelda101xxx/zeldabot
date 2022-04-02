exports.messageHandler = messageHandler;
const { setCooldown, getCooldown } = require("../helpers/cooldownhelper.js")
const { addToDB, addEmoteToDB, getTwitchStreamStatus, addTwitchUserToDB } = require("../database.js")
const { getGosumemoryData, kagamiBanRNG, banRNG } = require("../functions.js")
const { logger } = require("../logger.js")
const { Commands } = require("../helpers/commandshelper.js")
const config = require("../config.json")
const open = require("open");
const { chatClient } = require("../utils/chatclient.js");
const isWhitelistEnabled = config.twitch.enable_whitelist
const whitelisted_users = config.twitch.whitelisted_users
const mysqlEnabled = config.mysql.enabled
const admins = config.twitch.admins

async function messageHandler(channel, user, msg, context) {
    const user_id = context.userInfo.userId
    const channel_id = context.channelId
    const command = msg.trim().toLowerCase().split(" ")[0]
    const commandToRun = Commands[command]
    const isMod = (context.userInfo.isMod || context.userInfo.isBroadcaster) ? true : false
    if (commandToRun) {
        if (commandToRun.adminOnly && admins.indexOf(user) < 0) return
        if (commandToRun.modOnly && !isMod) return
    }
    if (channel) {
        if (user.toLowerCase() == "kagami_77") {
            kagamiBanRNG(channel, user)
        }
        else {
            banRNG(channel, user)
        }
        if (mysqlEnabled) {
            addTwitchUserToDB(user_id, user)
            addToDB(user_id, channel_id)
            addEmoteToDB(user_id, msg, context.parseEmotes(), channel_id)
        }
        if (!commandToRun) return
        if (commandToRun.isOsuCommand == true) {
            var data = await getGosumemoryData().catch(e => {
                if ((e == "osu! is not fully loaded!" || e.code == "ECONNREFUSED") && (isMod)) {
                    open("osu://spectate/chocomint")
                    chatClient.say(channel, "osu! isn't open/crashed, attempting to restart...")
                }
            })
        }
        if (!data && commandToRun.isOsuCommand == true) return
        var online = await getTwitchStreamStatus(channel_id)
        const cooldown = getCooldown(command)
        if (!isMod && online) {
            if (commandToRun.offlineOnly) return chatClient.deleteMessage(channel, context)
            else if (cooldown && !isMod) return chatClient.deleteMessage(channel, context)
            else if (isWhitelistEnabled && whitelisted_users.indexOf(context.userInfo.userName) < 0 && command != "!np") return chatClient.deleteMessage(channel, context)
            if (data && commandToRun.requiredState && data.menuState != commandToRun.requiredState) return chatClient.deleteMessage(channel, context)
        }
        setCooldown(command)
        logger.debug(`Executing !${commandToRun.name} from user: ${user} in channel: ${channel}.`)
        commandToRun.execute(channel, user, msg, context, chatClient, data)
    }
    else {
		if (!commandToRun) return
		var data = await getGosumemoryData().catch(e => {
			if ((e == "osu! is not fully loaded!" || e.code == "ECONNREFUSED")) {
				open("osu://spectate/chocomint")
				chatClient.say(channel, "osu! isn't open/crashed, attempting to restart...")
			}
		})
		if (!data) return
		if (commandToRun.adminOnly) return
		logger.debug(`Executing !${commandToRun.name} from user: ${user} in whispers.`)
		if (commandToRun.canWhisper) {
			commandToRun.execute(null, user, msg, context, chatClient, data)
		}
    }
}

exports.messageHandler = messageHandler