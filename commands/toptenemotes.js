const { getTopTenEmotes, getTopTenEmotesByUserID, getUserIdByUsername } = require("../database.js")

module.exports = {
	name: "toptenemotes",
	aliases: [],
	description: "",
	canWhisper: false,
	offlineOnly: true,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context) {
		if (msg.toLowerCase().split(" ").length == 1) {
			let emotes = await getTopTenEmotes(context.channelId)
			var messageToSend = ""
			for (let i = 0; i < 10; i++) messageToSend += `${emotes[i].emote} `
			return messageToSend
		}
		else if (msg.toLowerCase().split(" ").length == 2) {
			const user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
			if (user_id) {
				let emotes = await getTopTenEmotesByUserID(context.channelId, user_id)
				let messageToSend = ""
				for (let i = 0; i < emotes.length; i++) messageToSend += `${emotes[i].emote} `
				return messageToSend
			}
			else return "User not found."
		}
	}
}