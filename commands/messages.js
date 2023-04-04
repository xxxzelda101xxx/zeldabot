import { getUserIdByUsername, getMessages, getAllMessages, getMessageRank, getMessageLeaderboard } from "../database.js"
import { numberWithCommas } from "../functions.js"
export default {
	name: "messages",
	aliases: [],
	description: "Returns how many messages a user has or number of messages sent in an entire channel.",
	canWhisper: false,
	offlineOnly: true,
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		var user_id = context.userInfo.userId
		var username = context.userInfo.userName
		var isUsername, isTotal, isAllChannels, totalMessages
		var isLeaderboard
		msg = msg.replace(/@/g, "")
		if (msg.toLowerCase().split(" ")[1] == "total") isTotal = true
		if (msg.toLowerCase().split(" ")[1] == "allchannels") isAllChannels = true
		//if (msg.toLowerCase().split(" ")[1] == "leaderboard") isLeaderboard = true
		else if (msg.toLowerCase().split(" ").length >= 2) isUsername = true
		if (isLeaderboard) {
			var page = msg.toLowerCase().split(" ")[2]
			if (isNaN(page)) page = 1
			var leaderboard = await getMessageLeaderboard(context.channelId, page - 1)
			var leaderboardArray = []
			for (var i = 0; i < 10; i++) {
				leaderboardArray.push(`#${leaderboard[i].rank} ${leaderboard[i].username} with ${numberWithCommas(leaderboard[i].total)} messages`)
			}
			return leaderboardArray
		}
		else if (isTotal) {
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
			return `${username} has sent ${totalMessages} (#${messageRank}) messages in this channel.`
		}
	}
}