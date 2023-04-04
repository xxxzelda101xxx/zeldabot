import { shigeapiClient } from "../utils/apiclient.js"
import config from "../config.json" assert { type: "json" }
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken

export default {
	name: "createreward",
	aliases: [],
	description: "Creates a new channel point reward with the given information.",
	canWhisper: false,
	isOsuCommand: false,
	adminOnly: true, 
	isPublic: false,
	execute: async function(msg, context, args) {
		if (!useSeparateBroadcasterToken) return ""
		let user = await shigeapiClient.users.getUserByName("shigetora")
		const cost = parseInt(msg.match(/\{([^)]+)\}/)[1])
		if (isNaN(cost)) return "Cost must be an integer!"
		if (cost < 1) return "Cost must be a positive integer!"
		if (cost > 2147483647) return "Cost must less than 2,147,483,647!"
		const prompt = msg.match(/\(([^)]+)\)/)[1]
		const title = msg.match(/\[([^)]+)\]/)[1]
		const rewards = await shigeapiClient.channelPoints.createCustomReward(user, { cost: cost, prompt: prompt, title: title })
		.catch(e => {
			throw new Error(e)
		})
		return `Created award ${title} with a cost of ${cost} channel points! Reward ID: ${rewards.id}`
	}
}