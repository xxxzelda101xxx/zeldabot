const { ScoreCalculator } = require("@kionell/osu-pp-calculator")
const scoreCalculator = new ScoreCalculator()

module.exports = {
	name: "currenttest",
	aliases: [""],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		if (data.menu.bm.rankedStatus >= 4) {
			var currentStats = data.getCurrentStats()
			var localOsuFile = await data.getOsuFile()
			const result1 = await scoreCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, count100: currentStats.hits["100"], count50: currentStats.hits["50"], countMiss: currentStats.hits["0"], maxCombo: currentStats.combo.max, mods: currentStats.leaderboard.ourplayer.mods })
			const result2 = await scoreCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, count100: currentStats.hits["100"] + currentStats.hits["0"], count50: currentStats.hits["50"], mods: currentStats.leaderboard.ourplayer.mods })
			const result3 = await scoreCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, mods: currentStats.leaderboard.ourplayer.mods })
			currentPP = result1.performance.totalPerformance.toFixed(2)
			fcPP = result2.performance.totalPerformance.toFixed(2)
			ssPP = result3.performance.totalPerformance.toFixed(2)
			if (channel) {
				chatClient.say(channel, `${currentStats.hits["100"]}x100/${currentStats.hits["50"]}x50/${currentStats.hits["0"]}xmiss ${parseInt(currentPP)}pp/${parseInt(fcPP)}pp if fc (${parseInt(ssPP)}pp for SS)`)
			}
			else {
				chatClient.whisper(channel, `${currentStats.hits["100"]}x100/${currentStats.hits["50"]}x50/${currentStats.hits["0"]}xmiss ${parseInt(currentPP)}pp/${parseInt(fcPP)}pp if fc (${parseInt(ssPP)}pp for SS)`)
			}
		}
		else {
			if (data.getGameMode() != 0) {
				if (channel) {
					chatClient.say(channel, "Only osu!standard is supported.")
				}
				else {
					chatClient.say(channel, "Only osu!standard is supported.")        
				}
				return
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
}