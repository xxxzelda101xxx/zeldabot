import { shigeapiClient } from "../utils/apiclient.js"
import config from '../config.json' assert { type: "json" }
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken

export default {
	name: "reward",
	aliases: [],
	description: "Returns info on a given reward",
	canWhisper: false,
	isOsuCommand: false,
	isPublic: true,
	execute: async function(msg, context, args) {
		if (!useSeparateBroadcasterToken) return ""
		var rewardName = msg.toLowerCase().split(" ")[1]
		if (rewardName == "scammed") {
			var redemptions = await shigeapiClient.channelPoints.getRedemptionsForBroadcasterPaginated("37575275", "22d062fa-bedf-4ed9-af87-72eaa1aac00a", "UNFULFILLED", { limit: 50 })
			var allRedemptions = await redemptions.getAll()
			return `Scammed has been redeemed ${allRedemptions.length} times.`
		}
		if (rewardName == "megascammed") {
			var redemptions = await shigeapiClient.channelPoints.getRedemptionsForBroadcasterPaginated("37575275", "92a7776d-9925-478d-9c96-13fa6ddbf17a", "UNFULFILLED", { limit: 50 })
			var allRedemptions = await redemptions.getAll()
			return `Mega Scammed has been redeemed ${allRedemptions.length} times.`
		}
		if (rewardName == "blame3") {
			var redemptions = await shigeapiClient.channelPoints.getRedemptionsForBroadcasterPaginated("37575275", "34f48b7d-25e1-4aeb-b622-39e63a9291d8", "UNFULFILLED", { limit: 50 })
			var allRedemptions = await redemptions.getAll()
			return `Blame3 has been redeemed ${allRedemptions.length} times.`
		}
	}
}