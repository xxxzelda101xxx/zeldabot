module.exports = {
	name: "ur",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data) {
		return `${data.getUR()} ur`
	}
}