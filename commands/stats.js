const { BeatmapCalculator } = require("@kionell/osu-pp-calculator")
const beatmapCalculator = new BeatmapCalculator()

module.exports = {
	name: "stats",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data) {
		var currentStats = data.getCurrentStats()
		var osuFile = await data.getOsuFile()
		var mods = currentStats.leaderboard.ourplayer.mods != "" ? currentStats.leaderboard.ourplayer.mods : data.menu.mods.str
		const result = await beatmapCalculator.calculate({ rulesetId: 0, fileURL: osuFile, mods: mods, accuracy: [] })
		.catch(e => {
			if (e.code == "ENOENT") throw new Error('Failed to calculate. Beatmap not found.');
		})
		let newSR = result.difficulty.starRating.toFixed(2)
		return `SR: ${newSR}★, Max Combo: ${data.getMaxCombo()}, ${data.getLength()}, ${data.getBpm()}bpm,  AR${data.getAR()}, CS${data.getCS()}, OD${data.getOD()}, HP${data.getHP()}`
	}
} 