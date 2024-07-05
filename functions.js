import { addSevenTVEmoteToDB, saveChannelToDB } from "./database.js"
import { apiClient, shigeapiClient } from "./utils/apiclient.js"
import { chatClient } from "./utils/chatclient.js"
import axios from 'axios'
import { logger } from "./logger.js"
import config from "./config.json" assert { type: "json" }

export async function kagamiBanRNG(channel, user, user_id, context) {
	var randomNumber = Math.floor(Math.random() * 1001)
	if (randomNumber == 727) {
		await chatClient.say(channel, "Kagami_77 hit the 1/1000 chance to get banned lmao.")
		await apiClient.moderation.banUser(context.channelId, config.twitch.moderator_id, { user: user_id, reason: "You hit the 1/1,000 chance to get banned get rekt lmao." })
	}
}

export async function get7TVUserIDFromTwitchUserID(twitch_user_id) {
	var data = await axios(`https://7tv.io/v3/users/twitch/${twitch_user_id}`)
	.catch(e => {
		logger.verbose(`Twitch ID ${twitch_user_id} doesn't exist on 7TV`)
		return
	})
	if (data) {
		return data.data.user.id
	}
	else return null
}

export async function banRNG(channel, user, user_id, context) {
	var randomNumber = Math.floor(Math.random() * 10000 + 1)
	var randomNumber2 = Math.floor(Math.random() * 1000000 + 1)
	if (randomNumber == 727 && randomNumber2 == 727) {
		await chatClient.say(channel, `${user} somehow managed to hit a 1 in 10,000 AND a 1 IN A MILLION chance at the SAME TIME!!! actually fucking impossible"`)
		await apiClient.moderation.banUser(context.channelId, { user: user_id, reason: "????????????????????????????" })
	}
	else if (randomNumber == 727) {
		if (context.userInfo.isBroadcaster) {
			await chatClient.say(channel, "Somehow shige hit the 1/10,000 chance to get banned. Is that good luck or bad luck?")
		}
		else if (context.userInfo.isMod) {
			await chatClient.say(channel, `${user} hit the 1/10,000 chance to get banned but is immune. smh.... shigeSumika`)
		}
		else {
			await chatClient.say(channel, `${user} hit the 1/10,000 chance to get banned lmao RIPBOZO`)
			await apiClient.moderation.banUser(context.channelId, { user: user_id, reason: "You hit the 1/10,000 chance to get banned get rekt lmao." })
		}
	}
	else if (randomNumber2 == 727) {
		if (context.userInfo.isBroadcaster) {
			await chatClient.say(channel, "Shige hit the 1/1,000,000 chance to get banned????")
		}
		else if (context.userInfo.isMod) {
			await chatClient.say(channel, `${user} hit the 1/1,000,000 chance to get banned but is immune. Ping shige and tell him to ban them anyways :)`)
		}
		else {
			await chatClient.say(channel, `${user} hit the 1/1,000,000 chance to get banned????? That's some god tier rng!!!"`)
			await apiClient.moderation.banUser(context.channelId, { user: user_id, reason: "You hit the 1/1,000,000 to get banned???????????????" })
		}
	}
}

export async function addAllSevenTVEmotesToDB(channel_id) {
	var data = await axios(`https://7tv.io/v3/users/twitch/${channel_id}`)
	.catch(e => {
		logger.verbose(`Twitch ID ${channel_id} doesn't exist on 7TV`)
		return
	})
	if (data) {
		console.log(channel_id)
		console.log(data.data.emote_set)
		var emotes = data.data.emote_set.emotes
		for (var i = 0; i < emotes.length; i++) {
			addSevenTVEmoteToDB(channel_id, emotes[i].name, emotes[i].id)
		}
	}
}

export function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export async function getChannelDataAndSaveToDB(channels) {
	for (var i = 0; i < channels.length; i++) {
		await getChannelData(channels[i])
	}
}

export async function getChannelData(channel_name) {
	var channel = await apiClient.users.getUserByName(channel_name)
	var seventv_channel_id = await get7TVUserIDFromTwitchUserID(channel.id)
	await saveChannelToDB(channel_name, channel.id, seventv_channel_id)
} 

export async function deleteMessage(channel_id, message_id) {
	try {
		await apiClient.moderation.deleteChatMessages(channel_id, message_id)
	}
	catch (e) {
		if (e._statusCode == 401) logger.error("Unable to delete message. 401 Unauthorized: You are likely missing the 'moderator:manage:chat_messages' scope.")
		if (e._statusCode == 403) logger.error("Unable to delete message. 403 Forbidden: You don't have permission to perform that action.")
		else logger.error("Unable to delete message. Status Code: " + e._statusCode)
	}
}

