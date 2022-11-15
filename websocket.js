const config = require("./config.json")
const { ScoreCalculator } = require("@kionell/osu-pp-calculator")
const scoreCalculator = new ScoreCalculator()
const url = config.osu.gosumemory_address
const WebSocket = require("ws")
const { GosuMemory } = require("./classes/gosumemory.js")
var osuData = {}


function startWebsocket() {
	const connection = new WebSocket(url)

	connection.onopen = () => {
		connection.send("Message From Client") 
	}

	connection.onerror = () => {}

	connection.on("close", () => {
		osuData = {}
		connection.terminate()
		setTimeout(function() {
			startWebsocket()
		}, 3000)
	})
	connection.onmessage = async(e)  => {
		var data = JSON.parse(e.data)
		if (data) {
			var mods = data.gameplay.leaderboard.ourplayer.mods != "" ? data.gameplay.leaderboard.ourplayer.mods : data.menu.mods.str
			var osuFile = await osuData.getOsuFile()
			var result = await scoreCalculator.calculate({ rulesetId: 0, fileURL: osuFile, count100: data.gameplay.hits["100"], count50: data.gameplay.hits["50"], countMiss: data.gameplay.hits["0"], maxCombo: data.gameplay.combo.max, mods: mods })
			var currentPP = result.performance.totalPerformance.toFixed(2)
			if (data.menu.state == 2 && data.menu.bm.time.current > osuData.menu.bm.time.current && currentPP > osuData.maxPP) {
				osuData.maxPP = currentPP
			}
			data = new GosuMemory(data)
			Object.assign(osuData, data)
		}
	}
}

module.exports.startWebsocket = startWebsocket
module.exports.osuData = osuData