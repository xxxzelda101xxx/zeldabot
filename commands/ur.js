module.exports = {
	name: "ur",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		if (channel) {
			chatClient.say(channel, `${data.getUR()} ur`)
		}
		else {
			chatClient.whisper(user, `${data.getUR()} ur`)
		}
	}
}