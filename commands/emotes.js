import { getEmotes, getEmoteRank, getUserIdByUsername } from "../database.js"
import { numberWithCommas } from "../functions.js"

export default {
	name: "emotes",
	aliases: [],
	description: "Returns how many times an emote has been used for given user or entire channel.",
	canWhisper: false,
	offlineOnly: true,
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		var user_id = context.userInfo.userId
		var username = context.userInfo.userName
		var originalMessage = msg
		var emoteToSearch = originalMessage.split(" ")[1]
		var isUsername, isTotal
		msg = msg.replace(/@/g, "")
		if (originalMessage.split(" ")[2] == "total") isTotal = true
		else if (originalMessage.split(" ").length == 3) isUsername = true
		if (isTotal) {
			var emote = await getEmotes(null, context.channelId, emoteToSearch)
			if (emote.emote != null) {
				var emoteRank = await getEmoteRank(emote.emote, context.channelId)
				return `${emote.emote} has been used ${numberWithCommas(emote.total)} times. (#${emoteRank})`
			}
			else {
				return "Emote not Found or not tracked."
			}
		}
		else if (isUsername) {
			user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[2])
			let emote = await getEmotes(user_id, context.channelId, emoteToSearch)
			if (user_id == null) {
				return "User not found."
			}
			else {
				if (emote) {
					return `${msg.toLowerCase().split(" ")[2]} has used the emote ${emote.emote} ${numberWithCommas(emote.uses)} times.`
				}
				else {
					return "Emote not Found or not tracked."
				}
			}
		}
		else {
			if (!msg.toLowerCase().split(" ")[1]) return "Invalid Command Usage"
			let emote = await getEmotes(user_id, context.channelId, emoteToSearch)
			if (emote) {
				return `${username} has used the emote ${emote.emote} ${numberWithCommas(emote.uses)} times.`
			}
			else {
				return "Emote not Found or not tracked."
			}
		}
	}
}