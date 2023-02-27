const { addSevenTVEmoteToDB } = require("./database.js")
const { apiClient } = require("./utils/apiclient")
const { chatClient } = require("./utils/chatclient.js")
const axios = require('axios')
const { logger } = require("./logger.js")
const config = require("./config.json")

async function kagamiBanRNG(channel, user) {
	var randomNumber = Math.floor(Math.random() * 1001)
	if (randomNumber == 727) {
		await chatClient.say(channel, "Kagami_77 hit the 1/1000 chance to get banned lmao.")
		await chatClient.ban(channel, user, "You hit the 1/1000 chance lmao get rekt")
	}
}

async function get7TVUserIDFromTwitchUserID(twitch_user_id) {
	var data = await axios.get(`https://7tv.io/v3/users/twitch/${twitch_user_id}`)
	.catch(e => {
		logger.error("Twitch user doesn't exist on 7TV")
		return
	})
	if (data) {
		return data.data.user.id
	}
}

async function banRNG(channel, user, context) {
	var randomNumber = Math.floor(Math.random() * 10000 + 1)
	var randomNumber2 = Math.floor(Math.random() * 1000000 + 1)
	if (randomNumber == 727 && randomNumber2 == 727) {
		await chatClient.say(channel, `${user} somehow managed to hit a 1 in 10,000 AND a 1 IN A MILLION chance at the SAME TIME!!! actually fucking impossible"`)
		await apiClient.moderation.banUser(context.channelId, config.twitch.moderator_id, { user: user, reason: "????????????????????????????" })
	}
	else if (randomNumber == 727) {
		if (context.userInfo.isBroadcaster) {
			await chatClient.say(channel, "Somehow shige hit the 1/10,000 chance to get banned. Is that good luck or bad luck?")
		}
		else if (context.userInfo.isMod) {
			await chatClient.say(channel, `${user} hit the 1/10,000 chance to get banned but is immune. smh.... shigeSumika`)
		}
		else {
			await chatClient.say(channel, `${user} hit the 1/10,000 chance to get banned lmao."`)
			await apiClient.moderation.banUser(context.channelId, config.twitch.moderator_id, { user: user, reason: "You hit the 1/10,000 chance to get banned get rekt lmao." })
		}
	}
	else if (randomNumber2 == 727) {
		if (context.userInfo.isBroadcaster) {
			await chatClient.say(channel, "Shige hit the 1/1,000,000 change to get banned????")
		}
		else if (context.userInfo.isMod) {
			await chatClient.say(channel, `${user} hit the 1/1,000,000 chance to get banned but is immune. Ping shige and tell him to ban them anyways :)`)
		}
		else {
			await chatClient.say(channel, `${user} hit the 1/1,000,000 chance to get banned????? That's some god tier rng!!!"`)
			await apiClient.moderation.banUser(context.channelId, config.twitch.moderator_id, { user: user, reason: "You hit the 1/1,000,000 to get banned???????????????" })
		}
	}
}

async function addAllSevenTVEmotesToDB(channel_id) {
	var data = await axios.get(`https://7tv.io/v3/users/twitch/${channel_id}`)
	var emotes = data.data.emote_set.emotes
	for (var i = 0; i < emotes.length; i++) {
		addSevenTVEmoteToDB(channel_id, emotes[i].name, emotes[i].id)
	}
}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

module.exports.banRNG = banRNG
module.exports.kagamiBanRNG = kagamiBanRNG
module.exports.numberWithCommas = numberWithCommas
module.exports.get7TVUserIDFromTwitchUserID = get7TVUserIDFromTwitchUserID
module.exports.addAllSevenTVEmotesToDB = addAllSevenTVEmotesToDB