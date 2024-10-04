import config from '../config.json' with { type: "json" }
import { getChannelData } from "../functions.js"
import { chatClient } from "../utils/chatclient.js"
import { apiClient } from "../utils/apiclient.js"

export default {
	name: "botjoin",
	aliases: [],
	description: "",
	canWhisper: true,
	execute: async function(msg, context, data, args) {
		var channelToJoin = msg.toLowerCase().split(" ")[1]
		if (!channelToJoin) {
			await getChannelData(context.userInfo.userName)
			chatClient.join(context.userInfo.userName)
			return `zeldabot has joined #${context.userInfo.userName}. By default the bot is muted, use !botunmute in YOUR chat to unmute zeldabot.`
		}
		else if (channelToJoin && config.twitch.admins.indexOf(context.userInfo.userName) > -1) {
			var channel = await apiClient.users.getUserByName(channelToJoin)
			if (channel) {
				await getChannelData(channel.name)
				chatClient.join(channel.name)
				return `zeldabot has joined #${channel.name}.`
			}
			else return "Channel doesn't exist!"
		}
		else return "You dont have permission to do that!"
	}
}