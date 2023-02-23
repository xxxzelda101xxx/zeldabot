const open = require('open');

module.exports = {
	name: "fixbot",
	aliases: ["fixosu"],
	description: "Opens a link to start spectating chocomint.",
	canWhisper: false,
	modOnly: true,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		await open('osu://spectate/chocomint')
		return "Attempting to fix the bot..."
	}
}