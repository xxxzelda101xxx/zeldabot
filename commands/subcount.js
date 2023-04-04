import { shigeapiClient } from "../utils/apiclient.js"
import config from '../config.json' assert { type: "json" }
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken

export default {
	name: "subcount",
	aliases: ["subs"],
	description: "Sends current number of subs.",
	canWhisper: false,
	isPublic: true,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		if (!useSeparateBroadcasterToken) return ""
		let user = await shigeapiClient.users.getUserByName("shigetora")
		const subs = await shigeapiClient.subscriptions.getSubscriptions(user)
		return `Subs: ${subs.total}, Sub Points: ${subs.points}`
	}
}