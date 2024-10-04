import { chatClient } from "../utils/chatclient.js"
import config from "../config.json" with { type: "json" };
const enableSubHandler = config.twitch.enable_subhandler

export function subHandler(channel, user, subInfo, context) {
	if (!enableSubHandler) return
	if (channel == "#shigetora" || channel == "shigetora") {
		if (subInfo.months == 12) chatClient.say(channel, `${user}, Thanks for subscribing for 1 year!`)
		else if (subInfo.months == 24) chatClient.say(channel, `${user}, Thanks for subscribing for 2 years! Enjoy your shiny new whale sub badge.`)
		else if (subInfo.months == 36) chatClient.say(channel, `${user}, Thanks for subscribing for 3 years! Enjoy your shiny new succ sub badge.`)
		else if (subInfo.months == 48) chatClient.say(channel, `${user}, Thanks for subscribing for 4 years! Enjoy your shiny new shigeXdw sub badge.`)
		else if (subInfo.months == 60) chatClient.say(channel, `${user}, Thanks for subscribing for 5 years! shige where is the 5 year badge shigeFish`)
	}
}