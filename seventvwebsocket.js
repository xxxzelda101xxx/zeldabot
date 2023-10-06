const url = "wss://events.7tv.io/v3"
import WebSocket from "ws"
import { addSevenTVEmoteToDB, getChannelIDBySevenTVID } from "./database.js"

export function startSevenTVWebsocket(channels) {
	const connection = new WebSocket(url)

	connection.onopen = () => {
		for (var i = 0; i < channels.length; i++) {
			if (channels[i]["seventv_channel_id"] != null) {
				var data = {
					"op": 35,
					"d": {
						"type": "emote_set.update",
						"condition": {
							"object_id": channels[i]["seventv_channel_id"]
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
		const symbolKey = Reflect.ownKeys(e).find(key => key.toString() === "Symbol(kData)")
		var data = JSON.parse(e[symbolKey])
		if (data.d?.body?.pushed) {
			var sevenTVChannelID = data.d.body.id
			var channel_id = await getChannelIDBySevenTVID(sevenTVChannelID)
			var emote = data.d?.body?.pushed[0].value.data
			var emoteName = emote.name
			var emoteID = emote.id
			await addSevenTVEmoteToDB(channel_id, emoteName, emoteID)
		}
		if (data.d?.body?.pulled) {
			console.log(data.d?.body?.pulled[0])
		}
	}
}