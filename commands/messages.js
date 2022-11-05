const { getUserIdByUsername, getMessages } = require("../database.js")
module.exports = {
	name: "messages",
	aliases: [],
	description: "Sends information on the song/map that is currently playing.",
	canWhisper: false,
	offlineOnly: true,
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient) {
		var user_id = context.userInfo.userId
		var isUsername, isTotal, totalMessages
		msg = msg.replace(/@/g, "")
		if (msg.toLowerCase().split(" ")[1] == "total") isTotal = true
		else if (msg.toLowerCase().split(" ").length == 2) isUsername = true
		if (isTotal) {
			totalMessages = await getMessages(null, context.channelId)
			return `A total of ${totalMessages} messages have been sent in this channel.`
		}
		else if (isUsername) {
			user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
			if (user_id) {
				totalMessages = await getMessages(user_id, context.channelId)
				return `${msg.toLowerCase().split(" ")[1]} has sent ${totalMessages} messages in this channel.`
			}
			else {
				return "User not found."
			}
		}
		else {
			totalMessages = await getMessages(user_id, context.channelId)
			return `${user} has sent ${totalMessages} messages in this channel.`
		}
	}
}