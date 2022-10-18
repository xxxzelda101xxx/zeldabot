const { getUserIdByUsername, whitelistUser } = require("../database.js")

module.exports = {
	name: "whitelist",
	aliases: [],
	description: "",
	canWhisper: false,
	isOsuCommand: false,
    modOnly: true, 
	execute: async function(channel, user, msg, context, chatClient, data) {
        user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
        if (user_id) {
            await whitelistUser(user_id)
            chatClient.say(channel, `${msg.toLowerCase().split(" ")[1]} has been added to the whitelist.`)
        }
        else {
            chatClient.say(channel, "User not found.")
        }
	}
}