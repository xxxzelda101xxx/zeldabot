const { getUserIdByUsername, unwhitelistUser } = require("../database.js")

module.exports = {
	name: "unwhitelist",
	aliases: [],
	description: "",
	canWhisper: false,
	isOsuCommand: false,
	modOnly: true, 
	isPublic: false,
	execute: async function(msg, context, data) {
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