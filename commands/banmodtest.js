const { shigeapiClient } = require("../utils/apiclient")

module.exports = {
	name: "banmodtest",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data) {
		const test = await shigeapiClient.requestScopes(["moderator:manage:banned_users"])
		console.log(test)
		const channel = await shigeapiClient.channels.getChannelInfoById('37575275');
		const userToBan = await shigeapiClient.users.getUserById('27416095');
		await shigeapiClient.moderation.banUser(channel, channel, { userId: userToBan });
		return "i wonder if this will work"
	}
}