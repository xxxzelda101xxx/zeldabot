const open = require("open")
module.exports = {
	name: "fixbot",
	aliases: [],
	description: "Sends information on the song/map that is currently playing.",
	canWhisper: true,
	modOnly: true, 
	isPublic: false,
	execute: async function() {
		await open("osu://spectate/chocomint")
		return "Hopefully it started spectating..."
	}
}