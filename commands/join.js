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
		if (!channelToJoin) {
			await getChannelData(msg.userInfo.userName)
			chatClient.join(msg.userInfo.userName)
			return `zeldabot has joined #${msg.userInfo.userName}. By default the bot is muted, use !unmute in YOUR chat to unmute zeldabot`
		}
		if (channelToJoin && config.twitch.admins.indexOf(msg.userInfo.userName) > 0) {
			var channel = await apiClient.users.getUserByName(channelToJoin)
			if (channel) {
				await getChannelData(channel.name)
				chatClient.join(channel.name)
				return `zeldabot has joined #${channel.name}.`
			}
			else return "Channel doesn't exist!"
		}
	}
}