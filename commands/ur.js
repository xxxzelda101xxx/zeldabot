export default {
	name: "ur",
	aliases: [],
	description: "Returns the current unstable rate.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		return `${data.getUR()} ur`
	}
}