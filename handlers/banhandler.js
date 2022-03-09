const { chatClient } = require("../utils/chatclient.js")

function banHandler(channel, user) {
    if (user == "hiagg") chatClient.say(channel, "Hiagg has been banned.")
    if (user == "seoulest") chatClient.say(channel, "Seouless (the sus weeb horror game streamer) has been banned. shigeSeouless")
    if (user == "tarantemo77") chatClient.say(channel, "tarantemo77 is perma horny (and also perma banned.)")
}

exports.banHandler = banHandler