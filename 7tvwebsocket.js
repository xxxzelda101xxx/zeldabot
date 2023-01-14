const url = "wss://events.7tv.io/v3"
const WebSocket = require("ws")
var test = {}

function start7TVWebsocket(channels) {
	const connection = new WebSocket(url)

	connection.onopen = () => {
        for (var i = 0; i < channels.length; i++) {
            console.log(channels[i]["7tv_channel_id"])
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
        if (data.d?.body?.pushed) {
            var data = JSON.parse(e[symbolKey])
            var username = data.d.body.actor.username
            var channel_id = await getUserIdByUsername(username)
            var emote = data.d?.body?.pushed[0].value.data
            console.log(username, channel_id, emote)
            await add7TVEmoteToDB(channel_id, emote)
        }
        if (data.d?.body?.pulled) {
            console.log(data.d?.body?.pulled[0])
        }
	}
}

module.exports.start7TVWebsocket = start7TVWebsocket