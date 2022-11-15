const { shigeapiClient } = require("../utils/apiclient")

module.exports = {
	name: "mark",
	aliases: [],
	description: "Creates a stream marker.",
	canWhisper: false,
	modOnly: true, 
	isPublic: false,
	execute: async function(msg, context, data) {
		let user = await shigeapiClient.users.getUserByName("shigetora")
		const description = msg.replace("!mark", "") 
		if (description) await shigeapiClient.streams.createStreamMarker(user, description)
		else await shigeapiClient.streams.createStreamMarker(user)
		//return "Stream marker set."
	}
}