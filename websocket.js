const config = require("./config.json")
const url = config.osu.gosumemory_address
const WebSocket = require("ws")
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
		global.gosumemoryData = JSON.parse(e.data)
	}
}

module.exports.startWebsocket = startWebsocket