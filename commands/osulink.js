import * as osu from "osu-api-v2-js"
import { setOsuUsername } from "../database.js"


export default {
	name: "osulink",
	description: "",
	canWhisper: true,
	execute: async function(msg, context, data, args) {
        const api = await osu.API.createAsync({id: config.osu.client_id, secret: config.osu.client_secret})
        const username = msg.toLowerCase().split(" ")[1]
        const user = await api.getUser(username)
        console.log(user)
	}
}