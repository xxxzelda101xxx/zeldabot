const { changeTwitchStreamStatus } = require("../database.js")


module.exports = {
	name: "online",
	aliases: [],
	description: "Marks the stream of online.",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	isOsuCommand: true,
	execute: async function(msg, context, args) {
		changeTwitchStreamStatus(context.channelId, true)
		return "Stream has been marked as online."
	}
}