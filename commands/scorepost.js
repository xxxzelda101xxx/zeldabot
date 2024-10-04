import path from "path"
import config from '../config.json' with { type: "json" }
const songsFolder = config.osu.Songs_folder
import { ScoreCalculator } from "@kionell/osu-pp-calculator"
const scoreCalculator = new ScoreCalculator()

export default {
	name: "scorepost",
	aliases: [],
	description: "Meme command to generate a reddit score post title.",
	canWhisper: true,
	isOsuCommand: true,
	requiredState: 7,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		var results = data.getResultsScreen()
		var currentStats = data.getCurrentStats()
		var osuFile = path.join(songsFolder, data.menu.bm.path.folder, data.menu.bm.path.file)
		var mods = currentStats.leaderboard.ourplayer.mods != "" ? currentStats.leaderboard.ourplayer.mods : data.menu.mods.str
		const result = await scoreCalculator.calculate({ rulesetId: 0, fileURL: osuFile, count100: currentStats.hits["100"], count50: currentStats.hits["50"], countMiss: currentStats.hits["0"], maxCombo: currentStats.combo.max, mods: mods })
		var pp = result.performance.totalPerformance.toFixed(2)
		var newSR = result.difficulty.starRating.toFixed(2)
		var scorepostString = `${data.getResultsPlayerName()} | ${data.getArtist()} - ${data.getTitle()} [${data.getDifficulty()}] +${mods} (${data.getMapper()}, ${newSR}★) ${data.getAccuracy()}% `
		if (data.resultsScreen["0"] > 0) scorepostString += `${results["0"]}xmiss `
		scorepostString += `| ${pp}pp `
		if (data.getUR() > 0) scorepostString += `| ${data.getUR()} ur`
		return scorepostString
	}
} 