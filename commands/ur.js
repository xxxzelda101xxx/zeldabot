module.exports = {
    name: `ur`,
    description: ``,
    canWhisper: true,
    isOsuCommand: true,
    execute: async function(channel, user, msg, context, chatClient, data) {
        if (channel) {
            chatClient.say(channel, `${data.getUR()} ur`)
        }
        else {
            chatClient.whisper(user, `${data.getUR()} ur`)
        }
    }
}