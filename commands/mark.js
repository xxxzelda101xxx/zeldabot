import { shigeapiClient } from "../utils/apiclient.js"
import config from '../config.json' with { type: "json" }
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken

export default {
	name: "mark",
	aliases: [],
	description: "Creates a stream marker.",
	canWhisper: false,
	modOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		if (!useSeparateBroadcasterToken) return ""
		let user = await shigeapiClient.users.getUserByName("shigetora")
		const description = msg.replace("!mark", "") 
		if (description) await shigeapiClient.streams.createStreamMarker(user, description)
		else await shigeapiClient.streams.createStreamMarker(user)
		//return "Stream marker set."
	}
}