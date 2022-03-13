const { getGosumemoryData, makeOsuActiveWindow } = require("../functions.js")
const { keyboard, Key } = require("@nut-tree/nut-js")
keyboard.config.autoDelayMs = 0
const config = require("../config.json")
const userToSpectate = config.osu.user_to_spectate
var lastGosuMemoryData

async function replaySaveLoop() {
	var data = await getGosumemoryData().catch(e => {return})
	if (data) {
		if (data.getResultsPlayerName() == userToSpectate) {
			if (lastGosuMemoryData != data.resultsScreen.score) {
				lastGosuMemoryData = data.resultsScreen.score
				makeOsuActiveWindow()
				setTimeout(() => {
					keyboard.type(Key.F2)
				}, 1000)
			}
		}
	}
	setTimeout(() => {
		replaySaveLoop()
	}, 2000)
}

exports.replaySaveLoop = replaySaveLoop