const { getUserIdByUsername, removeMessagesFromUser, addMessagesToUser } = require("../database.js")
module.exports = {
	name: "editmessages",
	aliases: [],
	description: "",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	execute: async function(msg, context) {
		if (msg.toLowerCase().split(" ").length != 3) return
		var username = msg.toLowerCase().split(" ")[1]
		var messagesToAddOrRemove = msg.toLowerCase().split(" ")[2]
		var user_id = await getUserIdByUsername(username)
		var channel_id = context.channelId
		if (messagesToAddOrRemove < 0 && user_id) {
			removeMessagesFromUser(channel_id, user_id, Math.abs(messagesToAddOrRemove))
			return `Removed ${Math.abs(messagesToAddOrRemove)} messages from ${username}.`
		}
		else if (messagesToAddOrRemove > 0 && user_id) {
			addMessagesToUser(channel_id, user_id, messagesToAddOrRemove)
			return `Added ${messagesToAddOrRemove} messages to ${username}.`
		}
		else {
			return "Invalid Command Usage"
		}
	}
}