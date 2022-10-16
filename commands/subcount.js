const { shigeapiClient } = require("../utils/apiclient")


module.exports = {
	name: "subcount",
	aliases: ["subs"],
	description: "Sends current number of subs.",
	canWhisper: false,
	isPublic: true,
	execute: async function(channel, user, msg, context, chatClient, data) {
		user = await shigeapiClient.users.getUserByName("shigetora")
		const subs = await shigeapiClient.subscriptions.getSubscriptions(user)
		chatClient.say(channel, `Subs: ${subs.total}, Sub Points: ${subs.points}`)
	}
}