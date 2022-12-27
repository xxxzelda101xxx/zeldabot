const { shigeapiClient } = require("../utils/apiclient")

module.exports = {
	name: "banmodtest",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data) {
		const channel = await shigeapiClient.channels.getChannelInfoById('37575275');
		const userToBan = await shigeapiClient.users.getUserById('27416095');
		await api.moderation.banUser(channel, channel, { userId: userToBan });
		return "i wonder if this will work"
	}
}