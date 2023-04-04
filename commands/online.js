import { changeTwitchStreamStatus } from "../database.js"

export default {
	name: "online",
	aliases: [],
	description: "Marks the stream of online.",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		changeTwitchStreamStatus(context.channelId, true)
		return "Stream has been marked as online."
	}
}