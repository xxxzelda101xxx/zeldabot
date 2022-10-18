const { shigeapiClient } = require("../utils/apiclient")

module.exports = {
	name: "mark",
	aliases: [],
	description: "Creates a stream marker.",
	canWhisper: false,
	modOnly: true, 
	execute: async function(channel, user, msg, context, chatClient, data) {
		user = await shigeapiClient.users.getUserByName("shigetora")
		const description = msg.replace("!mark", "") 
		console.log(description)
		if (description) await shigeapiClient.streams.createStreamMarker(user, description)
		else await shigeapiClient.streams.createStreamMarker(user)
		//chatClient.say(channel, "Stream marker set.")
	}
}