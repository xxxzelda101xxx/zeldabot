const { getUserIdByUsername, getWatchTime } = require("../database.js")
module.exports = {
	name: "watchtime",
	description: "",
	canWhisper: false,
	offlineOnly: true,
	execute: async function(channel, user, msg, context, chatClient) {
		var user_id = context.userInfo.userId
		var isUsername, isTotal, onlineTime
		msg = msg.replace(/@/g, "")
		if (msg.toLowerCase().split(" ")[1] == "total") isTotal = true
		else if (msg.toLowerCase().split(" ").length == 2) isUsername = true
		if (isTotal) {
			onlineTime = await getWatchTime(null, context.channelId)
			chatClient.say(channel,`${onlineTime}`)
		}
		else if (isUsername) {
			user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
			if (user_id) {
				onlineTime = await getWatchTime(user_id, context.channelId)
				chatClient.say(channel, `${msg.toLowerCase().split(" ")[1]} has been watching for a total of ${onlineTime}.`)
			}
			else {
				chatClient.say(channel, "User not found.")
			}
		}
		else {
			onlineTime = await getWatchTime(user_id, context.channelId)
			chatClient.say(channel,`${user} has been watching for a total of ${onlineTime}.`)
		}
	}
}