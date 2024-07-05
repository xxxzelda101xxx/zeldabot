import config from '../config.json' assert { type: "json" }
import { getChannelData } from "../functions.js"
import { chatClient } from "../utils/chatclient.js"

export default {
	name: "join",
	aliases: [],
	description: "",
	canWhisper: true,
	execute: async function(msg, context, data, args) {
		var channelToJoin = msg.toLowerCase().split(" ")[1]
		console.log(channelToJoin)
		console.log(context.userInfo.userName)
		console.log(config.twitch.admins.indexOf(context.userInfo.userName) > 0)
		if (!channelToJoin) {
			await getChannelData(context.userInfo.userName)
			chatClient.join(context.userInfo.userName)
			return `zeldabot has joined #${context.userInfo.userName}. By default the bot is muted, use !unmute in YOUR chat to unmute zeldabot.`
		}
		else if (channelToJoin && config.twitch.admins.indexOf(context.userInfo.userName) > 0) {
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