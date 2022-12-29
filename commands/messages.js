const { getUserIdByUsername, getMessages, getAllMessages } = require("../database.js")
const { numberWithCommas } = require("../functions.js")
module.exports = {
	name: "messages",
	aliases: [],
	description: "Sends information on the song/map that is currently playing.",
	canWhisper: false,
	offlineOnly: true,
	isPublic: false,
	execute: async function(msg, context) {
		var user_id = context.userInfo.userId
		var username = context.userInfo.userName
		var isUsername, isTotal, totalMessages
		msg = msg.replace(/@/g, "")
		if (msg.toLowerCase().split(" ")[1] == "total") isTotal = true
		else if (msg.toLowerCase().split(" ")[1] == "allchannels") isAllChannels = true
		else if (msg.toLowerCase().split(" ").length == 2) isUsername = true
		if (isTotal) {
			totalMessages = await getMessages(null, context.channelId)
			totalMessages = numberWithCommas(totalMessages)
			return `A total of ${totalMessages} messages have been sent in this channel.`
		}
		else if (isAllChannels) {
			totalMessages = await getAllMessages()
			totalMessages = numberWithCommas(totalMessages)
			return `A total of ${totalMessages} messages have been sent.`
		}
		else if (isUsername) {
			user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
			if (user_id) {
				totalMessages = await getMessages(user_id, context.channelId)
				totalMessages = numberWithCommas(totalMessages)
				return `${msg.toLowerCase().split(" ")[1]} has sent ${totalMessages} messages in this channel.`
			}
			else {
				return "User not found."
			}
		}
		else {
			totalMessages = await getMessages(user_id, context.channelId)
			totalMessages = numberWithCommas(totalMessages)
			return `${username} has sent ${totalMessages} messages in this channel.`
		}
	}
}