const { getUserIdByUsername, whitelistUser } = require("../database.js")

module.exports = {
	name: "whitelist",
	aliases: ["wl"],
	description: "",
	canWhisper: false,
	isOsuCommand: false,
	adminOnly: true, 
	isPublic: false,
	execute: async function(msg) {
		var user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
		if (user_id) {
			await whitelistUser(user_id)
			return `${msg.toLowerCase().split(" ")[1]} has been added to the whitelist.`
		}
		else {
			return "User not found."
		}
	}
}