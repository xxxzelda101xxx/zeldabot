const { changeTwitchStreamStatus } = require("../database.js")


module.exports = {
	name: "offline",
	aliases: [],
	description: "",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, data) {
		changeTwitchStreamStatus(context.channelId, false)
		return "Stream has been marked as offline."
	}
}