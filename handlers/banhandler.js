const { chatClient } = require("../utils/chatclient.js")
const { incrementBans, getUserIdByUsername } = require("../database.js")

async function banHandler(channel, user) {
	var user_id = await getUserIdByUsername(user)
	var channel_id = await getUserIdByUsername(channel)
	console.log(user_id, channel_id)
	await incrementBans(user_id, channel_id)
	if (user == "hiagg") chatClient.say(channel, "Hiagg has been banned.")
	if (user == "seoulest") chatClient.say(channel, "Seouless (the sus weeb horror game streamer) has been banned. shigeSeouless")
	if (user == "tarantemo77") chatClient.say(channel, "tarantemo77 is perma horny (and also perma banned.)")
}

exports.banHandler = banHandler