import { ScoreCalculator } from "@kionell/osu-pp-calculator"
import { getMaxPP } from "../websocket.js"
const scoreCalculator = new ScoreCalculator()
import path from "path"
import config from "../config.json" assert { type: "json" }
const songsFolder = config.osu.Songs_folder

export default {
	name: "current",
	aliases: [],
	description: "Returns the current data for the ongoing osu play.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		if (data.menu.state == 2 || data.menu.state == 7) {	
			var currentStats = data.getCurrentStats()
			var osuFile = path.join(songsFolder, data.menu.bm.path.folder, data.menu.bm.path.file)
			var mods = currentStats.leaderboard.ourplayer.mods != "" ? currentStats.leaderboard.ourplayer.mods : data.menu.mods.str
			const result1 = await scoreCalculator.calculate({ rulesetId: 0, fileURL: osuFile, count100: currentStats.hits["100"], count50: currentStats.hits["50"], countMiss: currentStats.hits["0"], maxCombo: currentStats.combo.max, mods: mods })
			.catch(e => {
				if (e.code == "ENOENT") throw new Error('Failed to calculate. Beatmap not found.')
				else throw new Error(e)
			})
			const result2 = await scoreCalculator.calculate({ rulesetId: 0, fileURL: osuFile, count100: currentStats.hits["100"] + currentStats.hits["0"], count50: currentStats.hits["50"], mods: mods })
			const result3 = await scoreCalculator.calculate({ rulesetId: 0, fileURL: osuFile, mods: mods })
			var currentPP = result1.performance.totalPerformance.toFixed(2)
			var fcPP = result2.performance.totalPerformance.toFixed(2)
			var ssPP = result3.performance.totalPerformance.toFixed(2)
			var maxPP = await getMaxPP()
			return `${currentStats.hits["100"]}x100/${currentStats.hits["50"]}x50/${currentStats.hits["0"]}xmiss ${parseInt(currentPP)}pp/${parseInt(fcPP)}pp if fc (${parseInt(ssPP)}pp for SS) Peak: ${maxPP}pp`
		}
		else return "Not currently in a map or on the score screen."
	}
} 