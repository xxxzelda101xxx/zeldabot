import { unmuteBotInChannel } from "../database.js"

export default {
	name: "unmute",
	aliases: [],
	description: "",
	canWhisper: true,
	execute: async function(msg, context, data, args) {
		if (context.userInfo.isMod || context.userInfo.isBroadcaster) {
			console.log(context.userInfo.id)
			await unmuteBotInChannel(context.userInfo.id)
			return "zeldabot has been unmuted."
		}
	}
}