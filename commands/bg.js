module.exports = {
    name: `bg`,
    description: ``,
    canWhisper: true,
    execute: async function(channel, user, msg, context, chatClient, data) {
        if (data.beatmapset_id > -1) {
            var link = data.getBackgroundLink()
            if (channel) {
                chatClient.say(channel, link)
            }
            else {
                chatClient.whisper(user, link)
            }
        }
    }
}