const url = "wss://events.7tv.io/v3"
const WebSocket = require("ws")
var test = {}

function start7TVWebsocket(channels) {
	const connection = new WebSocket(url)

	connection.onopen = () => {
        for (var i = 0; i < channels.length; i++) {
            var data = {
                "op": 35,
                "d": {
                    "type": "emote_set.update",
                    "condition": {
                        "object_id": "6196be3a6467596b1d626b7c"
                    }
                }
            }
            connection.send(JSON.stringify(data)) 
        }
	}

	connection.onerror = (e) => {
        console.log(e)
    }

	connection.onmessage = async(e)  => {
        const symbolKey = Reflect.ownKeys(e).find(key => key.toString() === 'Symbol(kData)')
        var data = JSON.parse(e[symbolKey])
        if (data.d?.body?.pushed) {
            console.log(data.d?.body?.pushed)
        }
        if (data.d?.body?.pulled) {
            console.log(data.d?.body?.pulled)
        }
	}
}

module.exports.start7TVWebsocket = start7TVWebsocket