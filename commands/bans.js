import { getUserIdByUsername, getBans } from"../database.js"
export default {
	name: "bans",
	aliases: [],
	description: "Returns how many bans a specified user has.",
	canWhisper: false,
	offlineOnly: true,
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		var user_id = context.userInfo.userId
		var username = context.userInfo.userName
		var isUsername, numberOfBans
		msg = msg.replace(/@/g, "")
		if (msg.toLowerCase().split(" ").length == 2) isUsername = true
		if (isUsername) {
			user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
			if (user_id) {
				numberOfBans = await getBans(user_id, context.channelId)
				return `${msg.toLowerCase().split(" ")[1]} has been banned ${numberOfBans} times in this channel.`
			}
			else {
				return "User not found or no bans on record."
			}
		}
		else {
			numberOfBans = await getBans(user_id, context.channelId)
			return `${username} has been banned ${numberOfBans} times in this channel.`
		}
	}
}