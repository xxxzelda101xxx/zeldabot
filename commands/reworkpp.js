module.exports = {
	name: "reworkpp",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	requiredState: 7,
	isPublic: false,
	execute: async function(msg, context, data) {
		var livePP = await data.getCurrentPP()
		var reworkPP = await data.getReworkPP()
		return `${reworkPP}pp (${livePP}pp on live.)`
	}
}