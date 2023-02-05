const { getUserIdByUsername, addBansToUser, removeMessagesFromUser } = require("../database.js")
module.exports = {
	name: "editbans",
	aliases: [],
	description: "",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context) {
		if (msg.toLowerCase().split(" ").length != 3) return
		var username = msg.toLowerCase().split(" ")[1]
		var bansToAddOrRemove = msg.toLowerCase().split(" ")[2]
		var user_id = await getUserIdByUsername(username)
		var channel_id = context.channelId
		if (bansToAddOrRemove < 0 && user_id) {
			removeMessagesFromUser(channel_id, user_id, Math.abs(bansToAddOrRemove))
			return `Removed ${Math.abs(bansToAddOrRemove)} bans from ${username}.`
		}
		else if (bansToAddOrRemove > 0 && user_id) {
			addBansToUser(channel_id, user_id, bansToAddOrRemove)
			return `Added ${bansToAddOrRemove} bans to ${username}.`
		}
		else {
			return "Invalid Command Usage"
		}
	}
}