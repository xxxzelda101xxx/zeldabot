const { shigeapiClient } = require("../utils/apiclient")
const config = require("../config.json")
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken

module.exports = {
	name: "subcount",
	aliases: ["subs"],
	description: "Sends current number of subs.",
	canWhisper: false,
	isPublic: true,
	isOsuCommand: false,
	execute: async function() {
		if (!useSeparateBroadcasterToken) return ""
		let user = await shigeapiClient.users.getUserByName("shigetora")
		const subs = await shigeapiClient.subscriptions.getSubscriptions(user)
		return `Subs: ${subs.total}, Sub Points: ${subs.points}`
	}
}