module.exports = {
	name: "bg",
	aliases: [],
	description: "Return the URL for the current maps background.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		if (data.beatmapset_id > -1) {
			return data.getBackgroundLink()
		}
		else return "Unable to get bg because beatmapset_id is 0"
	}
}