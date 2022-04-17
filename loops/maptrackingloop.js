const { updateMaps } = require("../database.js")
const config = require("../config.json")
const userToSpectate = config.osu.user_to_spectate

async function mapTrackingLoop() {
	// eslint-disable-next-line no-undef
	var data = gosumemoryData
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