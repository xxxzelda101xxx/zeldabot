const { ScoreCalculator } = require("@kionell/osu-pp-calculator")
const scoreCalculator = new ScoreCalculator()
const path = require("path")
const config = require("../config.json")
const songsFolder = config.osu.Songs_folder


module.exports = {
	name: "pp",
	aliases: ["nppp"],
	description: "Returns how much pp the current map is worth with the given mods and accuracy.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		if (msg.toLowerCase().split(" ").length == 1) {
			var pp = await data.getCurrentPP()
			return `${pp}pp`
		}
		else if (msg.toLowerCase().split(" ").length > 1 && msg.toLowerCase().split(" ").length < 4) {
			var mods = ""
			var accuracy = 100
			if (msg.indexOf("+") > -1) {
				var msgArray = msg.split(" ")
				for (var i = 0; i < msgArray.length; i++) {
					if (msgArray[i].indexOf("+") > -1) {
						mods = msgArray[i].substring(1).toLowerCase()
						if (msgArray.length == 2) accuracy = 100
						else if (i == 1) accuracy = Number(msg.toLowerCase().split(" ")[2]).toFixed(2)
						else accuracy = Number(msg.toLowerCase().split(" ")[1]).toFixed(2)
					}
				}
			}
			console.log(msg.toLowerCase().split(" ")[1])
			else if (isNaN(msg.toLowerCase().split(" ")[1])) {
				mods = msg.toLowerCase().split(" ")[1]
				console.log(mods)
			}

			if (mods.length == 0) {
				var currentStats = data.getCurrentStats()
				mods = currentStats.leaderboard.ourplayer.mods != "" ? currentStats.leaderboard.ourplayer.mods : data.menu.mods.str
			}

			var fixed_mods_string = ""
			if (mods.length > 0) {
				var valid_mods = ["nf", "ez", "td", "hd", "hr", "ht", "dt", "nc", "fl", "so"]
				var selected_mods = mods.match(/.{1,2}/g)

				for (let i = 0; i < selected_mods.length; i++) {
					valid_mods.filter(mod => {
						if (mod == selected_mods[i]) {
							if (fixed_mods_string.indexOf(mod) < 0) fixed_mods_string += mod
						}
					})
				}
			}
			//if (msg.indexOf("+") < 0) accuracy = Number(msg.toLowerCase().split(" ")[1]).toFixed(2)
			if (accuracy > 100) accuracy = 100
			if (accuracy < 33.33) accuracy = 33.33
			var osuFile = path.join(songsFolder, data.menu.bm.path.folder, data.menu.bm.path.file)
			const score = await scoreCalculator.calculate({ rulesetId: 0, fileURL: osuFile, accuracy: Number(accuracy), mods: fixed_mods_string })
			var calculateAccuracy = score.scoreInfo.accuracy * 100
			calculateAccuracy = calculateAccuracy.toFixed(2)
			return `${score.performance.totalPerformance.toFixed(2)}pp for a ${calculateAccuracy}% (${score.scoreInfo.count100}x100) ${fixed_mods_string.toUpperCase()} fc.`
		}
		else {
			return "Invalid command usage. Example usage: \"!pp +HDHR 100"
		}
	}
}