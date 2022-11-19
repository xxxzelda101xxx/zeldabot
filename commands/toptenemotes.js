const { getTopTenEmotes, getTopTenEmotesByUserID } = require("../database.js")

module.exports = {
	name: "toptenemotes",
	aliases: [],
	description: "",
	canWhisper: false,
	offlineOnly: true,
	isPublic: false,
	execute: async function(msg, context) {
		if (msg.toLowerCase().split(" ").length == 1) {
			let emotes = await getTopTenEmotes(context.channelId)
			var messageToSend = ""
			for (let i = 0; i < 10; i++) messageToSend += `${emotes[i].emote} `
			return messageToSend
		}
	}
}