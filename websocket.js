const config = require("./config.json")
const url = config.osu.gosumemory_address
const WebSocket = require("ws")
const { GosuMemory } = require("./classes/gosumemory.js")
let osuData = {}

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
	connection.onmessage = (e) => {
		var data = JSON.parse(e.data)
		if (data) {
			data = new GosuMemory(data)
			osuData = data
			console.log("test", osuData)
		}
	}
}

module.exports.startWebsocket = startWebsocket
module.exports.osuData = osuData