import * as osu from "osu-api-v2-js"
import config from '../config.json' assert { type: "json" }
import { getOsuUsername } from "../database.js"
import { lastMap } from "../handlers/messagehandler.js"

export default {
                name: "osuc",
                description: "",
                canWhisper: true,
                execute: async function(msg, context, data, args) {
                const api = await osu.API.createAsync({id: config.osu.client_id, secret: config.osu.client_secret})
                var username
                if (msg.toLowerCase().split(" ").length == 1) username = await getOsuUsername(context.userInfo.userId)
                else username = msg.toLowerCase().split(" ")[1]
                if (username == "" || username == null) return "Please set your osu! username using !osulink <osu! username>!"
                const user = await api.getUser(username)
                console.log(lastMap[context.channelId])
                const score = (await api.getBeatmapUserScore(lastMap[context.channelId], user))
                if (!score) return "User doesn't have a score on this map!"
                const beatmapDifficulty = await api.getBeatmapDifficultyAttributesOsu(score.beatmap, score.mods) // Specifying the mods so the SR is adapted to them
                var pp
                if (score.pp != null) pp = `${score.pp.toFixed(2)}pp `
                else pp = ""
                var mods = `+${score.mods.toString()} `
                if (mods == "+ ") mods = ""

                const x = `${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}]`
                const y = `${mods}${(score.accuracy * 100).toFixed(2)}% ${pp}(${beatmapDifficulty.star_rating.toFixed(2)}*)`
                return `${x} ${y}`
        }
}