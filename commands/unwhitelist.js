const { getUserIdByUsername, unwhitelist } = require("../database.js")

module.exports = {
	name: "unwhitelist",
	aliases: [],
	description: "",
	canWhisper: false,
	isOsuCommand: false,
    modOnly: true, 
	execute: async function(channel, user, msg, context, chatClient, data) {
        user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
        if (user_id) {
            await unwhitelist(user_id)
            chatClient.say(channel, `${msg.toLowerCase().split(" ")[1]} has been removed from the whitelist.`)
        }
        else {
            chatClient.say(channel, "User not found.")
        }
	}
}