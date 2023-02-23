const { BeatmapCalculator } = require("@kionell/osu-pp-calculator")
const beatmapCalculator = new BeatmapCalculator()
const unsubmittedDownloadPath = "https://blameseouless.com/osufiles/"
const path = require("path")


module.exports = {
	name: "stats",
	aliases: [],
	description: "Returns stats for the current map.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		var currentStats = data.getCurrentStats()
		var osuFile = path.join(data.menu.bm.path.folder, data.menu.bm.path.file)
		var mods = currentStats.leaderboard.ourplayer.mods != "" ? currentStats.leaderboard.ourplayer.mods : data.menu.mods.str
		const result = await beatmapCalculator.calculate({ rulesetId: 0, fileURL: unsubmittedDownloadPath + osuFile, mods: mods, accuracy: [] })
		.catch(e => {
			if (e.code == "ENOENT") throw new Error('Failed to calculate. Beatmap not found.')
			else throw new Error(e)
		})
		let newSR = result.difficulty.starRating.toFixed(2)
		return `SR: ${newSR}★, Max Combo: ${data.getMaxCombo()}, ${data.getLength()}, ${data.getBpm()}bpm,  AR${data.getAR()}, CS${data.getCS()}, OD${data.getOD()}, HP${data.getHP()}`
	}
} 