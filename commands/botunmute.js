import { unmuteBotInChannel } from "../database.js"

export default {
	name: "botunmute",
	aliases: [],
	description: "",
	canWhisper: true,
	execute: async function(msg, context, data, args) {
		if (context.userInfo.isMod || context.userInfo.isBroadcaster) {
			console.log(context.userInfo.userId)
			await unmuteBotInChannel(context.userInfo.userId)
			return "zeldabot has been unmuted."
		}
	}
}