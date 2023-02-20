const { getUserIdByUsername, getMessages, getAllMessages, getMessageRank } = require("../database.js")
const { numberWithCommas } = require("../functions.js")
module.exports = {
	name: "messages",
	aliases: [],
	description: "Sends information on the song/map that is currently playing.",
	canWhisper: false,
	offlineOnly: true,
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context) {
		var user_id = context.userInfo.userId
		var username = context.userInfo.userName
		var isUsername, isTotal, isAllChannels, totalMessages
		msg = msg.replace(/@/g, "")
		if (msg.toLowerCase().split(" ")[1] == "total") isTotal = true
		if (msg.toLowerCase().split(" ")[1] == "allchannels") isAllChannels = true
		if (msg.toLowerCase().split(" ").length == 2) isUsername = true
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
				var messageRank = await getMessageRank(user_id, context.channelId)
				totalMessages = await getMessages(user_id, context.channelId)
				totalMessages = numberWithCommas(totalMessages)
				return `${msg.toLowerCase().split(" ")[1]} has sent ${totalMessages} (#${messageRank}) messages in this channel.`
			}
			else {
				return "User not found."
			}
		}
		else {
			totalMessages = await getMessages(user_id, context.channelId)
			totalMessages = numberWithCommas(totalMessages)
			var messageRank = await getMessageRank(user_id, context.channelId)
			console.log(messageRank)
			return `${username} has sent ${totalMessages} (#${messageRank}) messages in this channel.`
		}
	}
}