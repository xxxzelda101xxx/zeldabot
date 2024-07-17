import * as osu from "osu-api-v2-js"
import config from '../config.json' assert { type: "json" }
import { getOsuUsername } from "../database.js"

export default {
	name: "osurecent",
	description: "",
	canWhisper: true,
	execute: async function(msg, context, data, args) {
        const api = await osu.API.createAsync({id: config.osu.client_id, secret: config.osu.client_secret})
        var scoreIndex = parseInt(msg.substring(7).trim().toLowerCase().split(" ")[0])
        if (isNaN(scoreIndex)) scoreIndex = 1
        var username
        if (msg.toLowerCase().split(" ").length == 1) username = await getOsuUsername(context.userInfo.userId)
        else username = msg.toLowerCase().split(" ")[1]
        if (username == "" || username == null) return "Please set your osu! username using !osulink <osu! username>!"
        const user = await api.getUser(username)
        if (scoreIndex > 100) return "You can't have more than 100 top plays!"
        const score = (await api.getUserScores(user, "recent", osu.Ruleset.osu, { lazer: true, fails: true }, {limit: scoreIndex}))[scoreIndex - 1]
        console.log(score)
        const beatmapDifficulty = await api.getBeatmapDifficultyAttributesOsu(score.beatmap, score.mods) // Specifying the mods so the SR is adapted to them
        var pp
        if (score.pp != null) pp = `${score.pp.toFixed(2)}pp `
        else pp = ""

        const x = `${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}]`
        const y = `+${score.mods.toString()} ${(score.accuracy * 100).toFixed(2)}% ${pp}(${beatmapDifficulty.star_rating.toFixed(2)}*)`
        return `${x} ${y}`
	}
}