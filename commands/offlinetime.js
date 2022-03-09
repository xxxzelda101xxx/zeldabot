const { getOfflineTime, getUserIdByUsername } = require("../database.js")
module.exports = {
    name: `offlinetime`,
    description: ``,
    canWhisper: false,
    offlineOnly: true,
    execute: async function(channel, user, msg, context, chatClient) {
        var user_id = context.userInfo.userId
        var isUsername, isTotal, offlineTime
        msg = msg.replace(/@/g, "")
        if (msg.toLowerCase().split(" ")[1] == "total") isTotal = true
        else if (msg.toLowerCase().split(" ").length == 2) isUsername = true
        if (isTotal) {
            offlineTime = await getOfflineTime(null, context.channelId)
            chatClient.say(channel,`${offlineTime} have been wasted in offline chat.`)
        }
        else if (isUsername) {
            user_id = await getUserIdByUsername(msg.toLowerCase().split(" ")[1])
            offlineTime = await getOfflineTime(user_id, context.channelId)
            chatClient.say(channel, `${msg.toLowerCase().split(" ")[1]} has been in offline chat for ${offlineTime}.`)
        }
        else {
            offlineTime = await getOfflineTime(user_id, context.channelId)
            chatClient.say(channel,`${user} has been in offline chat for ${offlineTime}.`)
        }
    }
}