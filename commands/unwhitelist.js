import { getUserIdByUsername, unwhitelistUser } from "../database.js"

export default {
	name: "unwhitelist",
	aliases: ["uwl"],
	description: "Unwhitelist a given user.",
	canWhisper: false,
	isOsuCommand: false,
	adminOnly: true,
	isPublic: false,
	execute: async function(msg, context, args) {
		let user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
		if (user_id) {
			await unwhitelistUser(user_id)
			return `${msg.toLowerCase().split(" ")[1]} has been removed from the whitelist.`
		}
		else {
			return "User not found."
		}
	}
}