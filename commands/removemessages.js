const { sqlQuery, getUserIdByUsername } = require("../database.js")
module.exports = {
	name: "removemessages",
	aliases: [""],
	description: "Sends information on the song/map that is currently playing.",
	canWhisper: false,
	adminOnly: true, 
	execute: async function(channel, user, msg, context, chatClient) {
		if (msg.toLowerCase().split(" ").length != 3) return
		var username = msg.toLowerCase().split(" ")[1]
		var messagesToRemove = msg.toLowerCase().split(" ")[2]
		getUserIdByUsername(username)
			.then(async function(user_id) {
				await sqlQuery(`UPDATE messages_test SET total = total - ${Number(messagesToRemove)} WHERE channel_id = ${context.channelId} AND user_id = ${user_id}`)
				chatClient.say(channel, `${messagesToRemove} messages have been removed from ${username}.`)
			})
			.catch((e) => {
				chatClient.say(channel, e)
			})
	}
}