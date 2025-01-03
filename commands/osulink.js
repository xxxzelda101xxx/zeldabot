import * as osu from "osu-api-v2-js"
import config from '../config.json' with { type: "json" }
import { setOsuUsername } from "../database.js"


export default {
	name: "osulink",
	description: "",
	canWhisper: true,
	execute: async function(msg, context, data, args) {
        const api = await osu.API.createAsync(config.osu.client_id, config.osu.client_secret)
        if (msg.toLowerCase().split(" ").length == 1) return "Please specify a username!"
        const username = msg.toLowerCase().split(" ")[1]
        const user = await api.getUser(username)
        setOsuUsername(context.userInfo.userId, user.username)
        return "You have linked your account to " + user.username
	}
}