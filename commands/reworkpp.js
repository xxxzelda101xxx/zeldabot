module.exports = {
	name: "reworkpp",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	requiredState: 7,
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var livePP = await data.getCurrentPP()
		var reworkPP = await data.getReworkPP()
		if (channel) {
			chatClient.say(channel, `${reworkPP}pp (${livePP}pp on live.)`)
		}
		else {
			chatClient.whisper(user, `${reworkPP}pp (${livePP}pp on live.)`)
		}
	}
}