const url = "wss://events.7tv.io/v3"
const WebSocket = require("ws")
var test = {}

function start7TVWebsocket(channels) {
	const connection = new WebSocket(url)

	connection.onopen = () => {
        for (var i = 0; i < channels.length; i++) {
            if (channels[i]["7tv_channel_id"] != null) {
                var data = {
                    "op": 35,
                    "d": {
                        "type": "emote_set.update",
                        "condition": {
                            "object_id": channels[i]["7tv_channel_id"]
                        }
                    }
                }
                connection.send(JSON.stringify(data)) 
            }
        }
	}

	connection.onerror = (e) => {
        console.log(e)
    }

	connection.onmessage = async(e)  => {
        const symbolKey = Reflect.ownKeys(e).find(key => key.toString() === 'Symbol(kData)')
        var data = JSON.parse(e[symbolKey])
        if (data) {
            console.log(data.d)
        }
	}
}

module.exports.start7TVWebsocket = start7TVWebsocket