const { chatClient } = require("../utils/chatclient.js")

function subHandler(channel, user, subInfo, context) {
    if (subInfo.months == 12) chatClient.say(channel, `${user}, Thanks for subscribing for 1 year!`)
	else if (subInfo.months == 24) chatClient.say(channel, `${user}, Thanks for subscribing for 2 years! Enjoy your shiny new whale sub badge.`)
	else if (subInfo.months == 36) chatClient.say(channel, `${user}, Thanks for subscribing for 3 years! Enjoy your shiny new succ sub badge. @shigetora 4 year sub badge when?`)
}

exports.subHandler = subHandler