module.exports = {
	name: "mods",
	aliases: [],
	description: "Sends current mod combination.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: true,
	execute: async function(msg, context, data) {
		var contents = data.getMods()
		return contents
	}
}