import { BeatmapCalculator } from "@kionell/osu-pp-calculator"
const beatmapCalculator = new BeatmapCalculator()
import path from "path"
import config from '../config.json' assert { type: "json" }
const songsFolder = config.osu.Songs_folder

export default {
	name: "stats",
	aliases: [],
	description: "Returns stats for the current map.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		var currentStats = data.getCurrentStats()
		var osuFile = path.join(songsFolder, data.menu.bm.path.folder, data.menu.bm.path.file)
		var mods = currentStats.leaderboard.ourplayer.mods != "" ? currentStats.leaderboard.ourplayer.mods : data.menu.mods.str
		const result = await beatmapCalculator.calculate({ rulesetId: 0, fileURL: osuFile, mods: mods, accuracy: [] })
		.catch(e => {
			if (e.code == "ENOENT") throw new Error('Failed to calculate. Beatmap not found.')
			else throw new Error(e)
		})
		let newSR = result.difficulty.starRating.toFixed(2)
		return `SR: ${newSR}★, Max Combo: ${data.getMaxCombo()}, ${data.getLength()}, ${data.getBpm()}bpm,  AR${data.getAR()}, CS${data.getCS()}, OD${data.getOD()}, HP${data.getHP()}`
	}
} 