const { shigeapiClient } = require("../utils/apiclient")

module.exports = {
	name: "adge",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data) {
		const channel = await shigeapiClient.channels.getChannelInfoById('37575275');
		await shigeapiClient.channels.startChannelCommercial(channel, "30")
		return "lmao hope you like ads you nerds zelda11Spin"
	}
}