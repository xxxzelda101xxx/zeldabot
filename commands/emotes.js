const { getEmotes, getUserIdByUsername } = require(`../database.js`)
module.exports = {
    name: `emotes`,
    description: ``,
    canWhisper: false,
    offlineOnly: true,
    execute: async function(channel, user, msg, context, chatClient) {
        var user_id = context.userInfo.userId
        var originalMessage = msg
        var emoteToSearch = originalMessage.split(" ")[1]
        var isUsername, isTotal
        msg = msg.replace(/@/g, "")
        if (originalMessage.split(" ")[2] == "total") isTotal = true
        else if (originalMessage.split(" ").length == 3) isUsername = true
        if (isTotal) {
            var emote = await getEmotes(null, context.channelId, emoteToSearch)
            if (emote.emote != null) {
                chatClient.say(channel, `${emote.emote} has been used ${emote.total} times.`)
            }
            else {
                chatClient.say(channel, "Emote not Found or not tracked.")
            }
        }
        else if (isUsername) {
            user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[2])
            var emote = await getEmotes(user_id, context.channelId, emoteToSearch)
            if (user_id == null) {
                chatClient.say(channel, `User not found.`)
            }
            else {
                if (emote) {
                    chatClient.say(channel, `${msg.toLowerCase().split(" ")[2]} has used the emote ${emote.emote} ${emote.uses} times.`)
                }
                else {
                    chatClient.say(channel, "Emote not Found or not tracked.")
                }
            }
        }
        else {
            if (!msg.toLowerCase().split(" ")[1]) return;
            var emote = await getEmotes(user_id, context.channelId, emoteToSearch)
            if (emote) {
                chatClient.say(channel, `${user} has used the emote ${emote.emote} ${emote.uses} times.`)
            }
            else {
                chatClient.say(channel, "Emote not Found or not tracked.")
            }
        }
    }
}