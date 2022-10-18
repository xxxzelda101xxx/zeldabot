const open = require("open")
module.exports = {
	name: "fixbot",
	aliases: [],
	description: "Sends information on the song/map that is currently playing.",
	canWhisper: true,
	modOnly: true, 
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		await open("osu://spectate/chocomint")
		chatClient.say(channel, "Hopefully it started spectating...")
	}
}