import { getUserIdByUsername, addBansToUser, removeBansFromUser } from "../database.js"
export default {
	name: "editbans",
	aliases: [],
	description: "Allows you to edit the number of bans for a given user.",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		if (msg.toLowerCase().split(" ").length != 3) return "Invalid Command Usage"
		var username = msg.toLowerCase().split(" ")[1]
		var bansToAddOrRemove = msg.toLowerCase().split(" ")[2]
		var user_id = await getUserIdByUsername(username)
		var channel_id = context.channelId
		if (bansToAddOrRemove < 0 && user_id) {
			removeBansFromUser(channel_id, user_id, Math.abs(bansToAddOrRemove))
			console.log(Math.abs(bansToAddOrRemove))
			return `Removed ${Math.abs(bansToAddOrRemove)} bans from ${username}.`
		}
		else if (bansToAddOrRemove > 0 && user_id) {
			addBansToUser(channel_id, user_id, bansToAddOrRemove)
			return `Added ${bansToAddOrRemove} bans to ${username}.`
		}
	}
}