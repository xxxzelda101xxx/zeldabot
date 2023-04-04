import { chatClient } from "../utils/chatclient.js"
import { incrementBans, getUserIdByUsername } from "../database.js"

async function banHandler(channel, user, msg) {
	var user_id = await getUserIdByUsername(user)
	if (user_id == null) return
	var channel_id = msg.channelId
	await incrementBans(user_id, channel_id)
	if (user == "hiagg") chatClient.say(channel, "Hiagg has been banned.")
	if (user == "seoulest") chatClient.say(channel, "Seouless (the sus weeb horror game streamer) has been banned. shigeSeouless")
	if (user == "tarantemo77") chatClient.say(channel, "tarantemo77 is perma horny (and also perma banned.)")
}

const _banHandler = banHandler
export { _banHandler as banHandler }