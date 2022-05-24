module.exports = {
	name: "mods",
	description: "Sends current mod combination.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: true,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var mods = data.getMods()
		if (mods.length == 0) {
			mods = "Nomod"
		}
		if (channel) {
			chatClient.say(channel, mods)
		}
		else {
			chatClient.whisper(user, mods)
		}
	}
}