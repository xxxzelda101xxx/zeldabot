module.exports = {
    name: `#1`,
    description: ``,
    canWhisper: true,
    requiredState: 7,
    isOsuCommand: true,
    execute: async function(channel, user, msg, context, chatClient, data) {
        var numberOneScore = data.getNumber1Score()
        if (!numberOneScore) return
        if (channel){
            chatClient.say(channel, `#1 score: ${numberOneScore.name} (${numberOneScore.maxCombo}x/${data.getMaxCombo()}x, ${numberOneScore.h100}x100/${numberOneScore.h50}x50/${numberOneScore.h0}xmiss, ${numberOneScore.accuracy}%, +${numberOneScore.mods})`)
        }
        else {
            chatClient.whisper(user, `#1 score: ${numberOneScore.name} (${numberOneScore.maxCombo}x/${data.getMaxCombo()}x, ${numberOneScore.h100}x100/${numberOneScore.h50}x50/${numberOneScore.h0}xmiss, ${numberOneScore.accuracy}%, +${numberOneScore.mods})`)
        }
    }
}