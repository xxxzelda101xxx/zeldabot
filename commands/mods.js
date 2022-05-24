module.exports = {
	name: "mods",
	description: "Sends current mod combination.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: true,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var contents = data.getMods()
		if (channel) {
			chatClient.say(channel, contents)
		}
		else {
			chatClient.whisper(user, contents)
		}
	}
}