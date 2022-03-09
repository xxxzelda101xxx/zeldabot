const open = require("open")
module.exports = {
    name: `fixbot`,
    description: `Sends information on the song/map that is currently playing.`,
    canWhisper: true,
    modOnly: true, 
    execute: async function(channel, user, msg, context, chatClient, data) {
        await open("osu://spectate/chocomint")
		chatClient.say(channel, "Hopefully it started spectating...")
    }
}