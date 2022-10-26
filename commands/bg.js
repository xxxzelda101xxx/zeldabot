module.exports = {
	name: "bg",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		if (data.beatmapset_id > -1) {
			return data.getBackgroundLink()
		}
	}
}