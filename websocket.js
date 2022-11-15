const config = require("./config.json")
const isRemote = config.osu.isRemote
const { ScoreCalculator } = require("@kionell/osu-pp-calculator")
const scoreCalculator = new ScoreCalculator()
const url = config.osu.gosumemory_address
const WebSocket = require("ws")
const { GosuMemory } = require("./classes/gosumemory.js")
const path = require("path")
var osuData = {}
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
		var data = JSON.parse(e.data)
		if (data) {
			var mods = data.gameplay.leaderboard.ourplayer.mods != "" ? data.gameplay.leaderboard.ourplayer.mods : data.menu.mods.str
			var osuFile = path.join(songsFolder, data.menu.bm.path.folder, data.menu.bm.path.file)
			var result = await scoreCalculator.calculate({ rulesetId: 0, fileURL: osuFile, count100: data.gameplay.hits["100"], count50: data.gameplay.hits["50"], countMiss: data.gameplay.hits["0"], maxCombo: data.gameplay.combo.max, mods: mods })
			var currentPP = result.performance.totalPerformance.toFixed(2)
			console.log("state: ", data?.menu?.state)
			console.log("current time: ", data?.menu?.bm?.time?.current)
			console.log("last time: ", osuData?.menu?.bm?.time?.current)
			console.log("Current PP", currentPP)
			console.log("Last PP", osuData?.maxPP)
			console.log(data?.menu?.state == 2)
			console.log(data?.menu?.bm?.time?.current > osuData?.menu?.bm?.time?.current)
			console.log(currentPP > osuData.maxPP)
			if (data?.menu?.state == 2 && data?.menu?.bm?.time?.current > osuData?.menu?.bm?.time?.current && currentPP > osuData.maxPP) {
				data.maxPP = currentPP
			}
			else {
				// eslint-disable-next-line no-self-assign
				data.maxPP = data.maxPP
			}
			data = new GosuMemory(data)
			Object.assign(osuData, data)
		}
	}
}

module.exports.startWebsocket = startWebsocket
module.exports.osuData = osuData