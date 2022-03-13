exports.messageHandler = messageHandler;
const { setCooldown, getCooldown } = require("../helpers/cooldownhelper.js")
const { addToDB, addEmoteToDB, getTwitchStreamStatus, addTwitchUserToDB } = require("../database.js")
const { getGosumemoryData } = require("../functions.js")
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
    if (channel) {
        if (user.toLowerCase() == "kagami_77") {
            var randomNumber = Math.floor(Math.random() * 1001);
            console.log(randomNumber, "kagami")
            if (randomNumber == 727) {
                await chatClient.say(channel, "Kagami_77 hit the 1/1000 chance to get banned lmao.")
                await chatClient.ban(channel, user, "You hit the 1/1000 chance lmao get rekted")
            }
        }
        else {
            var randomNumber = Math.floor(Math.random() * 10000 + 1);
            console.log(randomNumber, "everybody else")
            if (randomNumber == 727) {
                if (context.userInfo.isBroadcaster) {
                    await chatClient.say(channel, `Somehow shige hit the 1/10,000 chance to get banned? Is that good luck or bad luck?`)
                }
                else if (context.userInfo.isMod) {
                    await chatClient.say(channel, `${user} hit the 1/10,000 chance to get banned but is immune. smh.... shigeSumika`)
                }
                else {
                    await chatClient.say(channel, `${user} hit the 1/10,000 chance to get banned lmao.`)
                await chatClient.ban(channel, user, "You hit the 1/10,000 chance lmao get rekted")
                }
            }
        }
        const user_id = context.userInfo.userId
        var command = msg.trim().toLowerCase().split(" ")[0]
        if (mysqlEnabled) {
            addTwitchUserToDB(user_id, user)
            addToDB(user_id, context.channelId)
            addEmoteToDB(user_id, msg, context.parseEmotes(), context.channelId)
        }
        if (!Commands[command]) return
        if (Commands[command].isOsuCommand == true) {
            var data = await getGosumemoryData().catch(e => {
                if ((e == "osu! is not fully loaded!" || e.code == "ECONNREFUSED")) {
                    open("osu://spectate/chocomint")
                    chatClient.say(channel, "osu! isn't open/crashed, attempting to restart...")
                }
            })
        }
        if (!data && Commands[command].isOsuCommand == true) return
        var online = await getTwitchStreamStatus(context.channelId)
        var commandFailed, modOnly, whitelistOnly, offlineOnly
        const cooldown = getCooldown(command)
        if (Commands[command].adminOnly && admins.indexOf(user) < 0) return
        if (!context.userInfo.isMod && !context.userInfo.isBroadcaster && online) {
            if (Commands[command].modOnly) commandFailed = true, modOnly = true
            else if (Commands[command].offlineOnly) commandFailed = true, offlineOnly = true
            else if (cooldown && (!context.userInfo.isMod && !context.userInfo.isBroadcaster)) commandFailed = true
            else if (isWhitelistEnabled && whitelisted_users.indexOf(context.userInfo.userName) < 0 && command != "!np") commandFailed = true, whitelistOnly = true
            if (data && Commands[command].requiredState && data.menuState != Commands[command].requiredState) commandFailed = true
        }
        if (commandFailed) {
            if (context.userInfo.isBroadcaster != 1 || context.userInfo.isMod != 1) {
                await chatClient.deleteMessage(channel, context)
                if (modOnly) chatClient.whisper(user, "Your message was deleted only mods may use that command.")
                else if (offlineOnly) chatClient.whisper(user, "Your message was deleted because this command only works while the stream is offline.")
                else if (cooldown) await chatClient.whisper(user, "Your message was deleted because the command is on cooldown.")
                else if (whitelistOnly) await chatClient.whisper(user, "Your message was deleted because only whitelisted users and mods may use that command.")
                return
            }
        }
        setCooldown(command)
        logger.debug(`Executing !${Commands[command].name} from user: ${user} in channel: ${channel}.`)
        Commands[command].execute(channel, user, msg, context, chatClient, data)
    }
    else {
        var command = msg.trim().toLowerCase().split(" ")[0]
		if (!Commands[command]) return
		var data = await getGosumemoryData().catch(e => {
			if ((e == "osu! is not fully loaded!" || e.code == "ECONNREFUSED")) {
				open("osu://spectate/chocomint")
				chatClient.say(channel, "osu! isn't open/crashed, attempting to restart...")
			}
		})
		if (!data) return
		if (Commands[command].adminOnly) return
		logger.debug(`Executing !${Commands[command].name} from user: ${user} in whispers.`)
		if (Commands[command].canWhisper) {
			Commands[command].execute(null, user, msg, context, chatClient, data)
		}
    }
}

exports.messageHandler = messageHandler