module.exports = {
    name: `current`,
    description: ``,
    canWhisper: true,
    isOsuCommand: true,
    execute: async function(channel, user, msg, context, chatClient, data) {
        if (data.getGameMode() != 0) {
            if (channel) {
                chatClient.say(channel, "Only osu!standard is supported.")
            }
            else {
                chatClient.say(channel, "Only osu!standard is supported.")        
            }
            return;
        }
        var currentStats = data.getCurrentStats()
        var currentPP = await data.getCurrentPP()
        var fcPP = await data.getPPIfFc()
        var ssPP = await data.getSSPP()
        if (channel) {
            chatClient.say(channel, `${currentStats.hits["100"]}x100/${currentStats.hits["50"]}x50/${currentStats.hits["0"]}xmiss ${parseInt(currentPP)}pp/${parseInt(fcPP)}pp if fc (${parseInt(ssPP)}pp for SS)`)
        }
        else {
            chatClient.whisper(user, `${currentStats.hits["100"]}x100/${currentStats.hits["50"]}x50/${currentStats.hits["0"]}xmiss ${parseInt(currentPP)}pp/${parseInt(fcPP)}pp if fc (${parseInt(ssPP)}pp for SS)`)
        }
    }
}