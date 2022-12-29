const config = require("./config.json")
const isRemote = config.osu.isRemote
const { ScoreCalculator } = require("@kionell/osu-pp-calculator")
const scoreCalculator = new ScoreCalculator()
const url = config.osu.gosumemory_address
const WebSocket = require("ws")
const { GosuMemory } = require("./classes/gosumemory.js")
const path = require("path")
const { logger } = require("./logger")
var osuData = {}
var maxPP = 0
var songsFolder
if (isRemote) {
	songsFolder = config.osu.osu_files_folder
}
else {
	songsFolder = config.osu.Songs_folder
}


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
		try {
			var data = JSON.parse(e.data)
			if (data && data?.menu?.state == 2) {
				var mods = data.gameplay.leaderboard.ourplayer.mods != "" ? data.gameplay.leaderboard.ourplayer.mods : data.menu.mods.str
				var osuFile = path.join(songsFolder, data.menu.bm.path.folder, data.menu.bm.path.file)
				var result = await scoreCalculator.calculate({ rulesetId: 0, fileURL: osuFile, count100: data.gameplay.hits["100"], count50: data.gameplay.hits["50"], countMiss: data.gameplay.hits["0"], maxCombo: data.gameplay.combo.max, mods: mods })
				.catch(e => {
					return
				})
				var currentPP = result.performance.totalPerformance.toFixed(2)
				if (data?.menu?.state == 2 && currentPP > maxPP) {
					maxPP = currentPP
				}
				else if (isNaN(maxPP)) {
					maxPP = 0
				}
				else if (data?.menu?.state == 2 && osuData?.menu?.bm?.time?.current > data?.menu?.bm?.time?.current) {
					maxPP = 0
				}
				data = new GosuMemory(data)
				Object.assign(osuData, data)
			}
			else if (data) {
				data = new GosuMemory(data)
				Object.assign(osuData, data)
			}
		}
		catch (e) {}
	}
}

async function getMaxPP() {
	return parseInt(maxPP)
}

module.exports.startWebsocket = startWebsocket
module.exports.osuData = osuData
module.exports.getMaxPP = getMaxPP