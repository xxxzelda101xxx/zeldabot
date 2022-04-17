const config = require("./config.json")
const url = config.osu.gosumemory_address
const WebSocket = require("ws")
const { GosuMemory } = require("./classes/gosumemory.js")
global.gosumemoryData = null

function startWebsocket() {
	const connection = new WebSocket(url)

	connection.onopen = () => {
		connection.send("Message From Client") 
	}

	connection.onerror = () => {}

	connection.on("close", () => {
		global.gosumemoryData = null
		connection.terminate()
		setTimeout(function() {
			startWebsocket()
		}, 3000)
	})
	connection.onmessage = (e) => {
		var data = JSON.parse(e.data)
		// eslint-disable-next-line no-undef
		if (data) {
			data = new GosuMemory(data)
			global.gosumemoryData = data
		}
	}
}

module.exports.startWebsocket = startWebsocket