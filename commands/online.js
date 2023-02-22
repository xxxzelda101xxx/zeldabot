const { changeTwitchStreamStatus } = require("./database.js")


module.exports = {
	name: "online",
	description: "",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, data) {
		changeTwitchStreamStatus(context.channelId, true)
	}
}