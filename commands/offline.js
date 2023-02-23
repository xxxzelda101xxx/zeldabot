const { changeTwitchStreamStatus } = require("../database.js")


module.exports = {
	name: "offline",
	aliases: [],
	description: "Marks the stream as offline.",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		changeTwitchStreamStatus(context.channelId, false)
		return "Stream has been marked as offline."
	}
}