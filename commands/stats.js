const { BeatmapCalculator } = require("@kionell/osu-pp-calculator")
const beatmapCalculator = new BeatmapCalculator();

module.exports = {
	name: "stats",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		if (data.menu.bm.rankedStatus >= 5) {
			var currentStats = data.getCurrentStats()
			const result = await beatmapCalculator.calculate({ rulesetId: 0, beatmapId: data.beatmap_id, mods: currentStats.leaderboard.ourplayer.mods, accuracy: [] })
			console.log(result)
			var newSR = result.difficulty.starRating.toFixed(2)
			return `SR: ${newSR}★, Max Combo: ${data.getMaxCombo()}, ${data.getLength()}, ${data.getBpm()}bpm,  AR${data.getAR()}, CS${data.getCS()}, OD${data.getOD()}, HP${data.getHP()}`
		}
		else {
			var newSR = await data.getNewSR()
			return `SR: ${newSR}★, Max Combo: ${data.getMaxCombo()}, ${data.getLength()}, ${data.getBpm()}bpm,  AR${data.getAR()}, CS${data.getCS()}, OD${data.getOD()}, HP${data.getHP()}`
		}
	}
}