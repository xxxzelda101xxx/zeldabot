const open = require('open');

module.exports = {
	name: "fixbot",
	aliases: ["fixosu"],
	description: "",
	canWhisper: false,
	modOnly: true,
	isPublic: false,
	execute: async function(msg, context, data) {
		await open('osu://spectate/chocomint')
		return "Attempting to fix the bot..."
	}
}