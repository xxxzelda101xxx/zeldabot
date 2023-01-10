const { getUserIdByUsername, getMessages, getBans } = require("../database.js")
module.exports = {
	name: "bans",
	aliases: [],
	description: "Sends information on the song/map that is currently playing.",
	canWhisper: false,
	offlineOnly: true,
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context) {
		var user_id = context.userInfo.userId
		var username = context.userInfo.userName
		var isUsername, numberOfBans
		msg = msg.replace(/@/g, "")
		if (msg.toLowerCase().split(" ").length == 2) isUsername = true
		if (isUsername) {
			user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
			if (user_id) {
				numberOfBans = await getBans(user_id, context.channelId)
				return `${msg.toLowerCase().split(" ")[1]} has been banned ${numberOfBans} times this channel.`
			}
			else {
				return "User not found or no bans on record."
			}
		}
		else {
			numberOfBans = await getBans(user_id, context.channelId)
			return `${username} has been banned ${numberOfBans} times this channel.`
		}
	}
}