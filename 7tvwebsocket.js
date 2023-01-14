const url = "wss://events.7tv.io/v3"
const WebSocket = require("ws")
var test = {}
const { getUserIdByUsername, add7TVEmoteToDB } = require('./database.js')

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
        var data = JSON.parse(e[symbolKey])
        if (data.d?.body?.pushed) {
            var username = data.d.body.actor.username
            var channel_id = await getUserIdByUsername(username)
            var emote = data.d?.body?.pushed[0].value.data
            var emoteName = emote.name
            var emoteID = emote.id
            console.log(username, channel_id, emoteName, emoteID)
            await add7TVEmoteToDB(channel_id, emoteName, emoteID)
        }
        if (data.d?.body?.pulled) {
            console.log(data.d?.body?.pulled[0])
        }
	}
}

module.exports.start7TVWebsocket = start7TVWebsocket