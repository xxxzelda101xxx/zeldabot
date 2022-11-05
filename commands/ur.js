module.exports = {
	name: "ur",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		return `${data.getUR()} ur`
	}
}