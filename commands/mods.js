module.exports = {
	name: "mods",
	aliases: [],
	description: "Sends current mod combination.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: true,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var contents = data.getMods()
		return chatClient.say(channel, contents)
	}
}