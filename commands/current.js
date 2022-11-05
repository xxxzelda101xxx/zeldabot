const { ScoreCalculator } = require("@kionell/osu-pp-calculator")
const scoreCalculator = new ScoreCalculator()

module.exports = {
	name: "current",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		if ((data.menu.state == 2 || data.menu.state == 7) && data.menu.bm.rankedStatus >= 5) {
			var currentStats = data.getCurrentStats()
			const result1 = await scoreCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, count100: currentStats.hits["100"], count50: currentStats.hits["50"], countMiss: currentStats.hits["0"], maxCombo: currentStats.combo.max, mods: currentStats.leaderboard.ourplayer.mods })
			const result2 = await scoreCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, count100: currentStats.hits["100"] + currentStats.hits["0"], count50: currentStats.hits["50"], mods: currentStats.leaderboard.ourplayer.mods })
			const result3 = await scoreCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, mods: currentStats.leaderboard.ourplayer.mods })
			currentPP = result1.performance.totalPerformance.toFixed(2)
			fcPP = result2.performance.totalPerformance.toFixed(2)
			ssPP = result3.performance.totalPerformance.toFixed(2)
			return `${currentStats.hits["100"]}x100/${currentStats.hits["50"]}x50/${currentStats.hits["0"]}xmiss ${parseInt(currentPP)}pp/${parseInt(fcPP)}pp if fc (${parseInt(ssPP)}pp for SS)`
		}
		else if ((data.menu.state == 2 || data.menu.state == 7) && data.beatmap_id > 0) {
			var currentStats = data.getCurrentStats()
			const result1 = await scoreCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, count100: currentStats.hits["100"], count50: currentStats.hits["50"], countMiss: currentStats.hits["0"], maxCombo: currentStats.combo.max, mods: currentStats.leaderboard.ourplayer.mods, bpm: data.getBpm(), approachRate: data.getAR(), overallDifficulty: data.getOD(), circleSize: data.getCS(), lockStats: true })
			const result2 = await scoreCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, count100: currentStats.hits["100"] + currentStats.hits["0"], count50: currentStats.hits["50"], mods: currentStats.leaderboard.ourplayer.mods, bpm: data.getBpm(), approachRate: data.getAR(), overallDifficulty: data.getOD(), circleSize: data.getCS(), lockStats: true })
			const result3 = await scoreCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, mods: currentStats.leaderboard.ourplayer.mods, bpm: data.getBpm(), approachRate: data.getAR(), overallDifficulty: data.getOD(), circleSize: data.getCS(), lockStats: true })
			currentPP = result1.performance.totalPerformance.toFixed(2)
			fcPP = result2.performance.totalPerformance.toFixed(2)
			ssPP = result3.performance.totalPerformance.toFixed(2)
			return `${currentStats.hits["100"]}x100/${currentStats.hits["50"]}x50/${currentStats.hits["0"]}xmiss ${parseInt(currentPP)}pp/${parseInt(fcPP)}pp if fc (${parseInt(ssPP)}pp for SS)`
		}
		else {
			var currentStats = data.getCurrentStats()
			var currentPP = await data.getCurrentPP()
			var fcPP = await data.getPPIfFc()
			var ssPP = await data.getSSPP()
			return `${currentStats.hits["100"]}x100/${currentStats.hits["50"]}x50/${currentStats.hits["0"]}xmiss ${parseInt(currentPP)}pp/${parseInt(fcPP)}pp if fc (${parseInt(ssPP)}pp for SS)`
		}
	}
}