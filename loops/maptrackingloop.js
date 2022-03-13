const { getGosumemoryData } = require("../functions.js")
const { updateMaps } = require("../database.js")
const config = require("../config.json")
const userToSpectate = config.osu.user_to_spectate

async function mapTrackingLoop() {
	var data = await getGosumemoryData().catch(e => {return})
	if (data) {
		if (data.getCurrentPlayerName() == userToSpectate) {
			await updateMaps(data)
		}
	}
	setTimeout(() => {
		mapTrackingLoop()
	}, 100)
}

exports.mapTrackingLoop = mapTrackingLoop