import * as osu from "osu-api-v2-js"
import config from '../config.json' assert { type: "json" }
import { getOsuUsername } from "../database.js"

export default {
	name: "osutop",
	description: "",
	canWhisper: true,
	execute: async function(msg, context, data, args) {
                const api = await osu.API.createAsync({id: config.osu.client_id, secret: config.osu.client_secret})
                var username
                if (msg.toLowerCase().split(" ").length == 1) username = await getOsuUsername(context.userInfo.userId)
                else username = msg.toLowerCase().split(" ")[1]
                const user = await api.getUser(username)
                const scoreIndex = msg.substring(7).trim().toLowerCase().split(" ")[0]
                console.log(scoreIndex)
                const score = (await api.getUserScores(user, "best", osu.Ruleset.osu, {lazer: false}, {limit: 1}))[0] // Specifying the Ruleset is optional
                const beatmapDifficulty = await api.getBeatmapDifficultyAttributesOsu(score.beatmap, score.mods) // Specifying the mods so the SR is adapted to them
        
                const x = `${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}]`
                const y = `+${score.mods.toString()} ${(score.accuracy * 100).toFixed(2)}% (${beatmapDifficulty.star_rating.toFixed(2)}*)`
                return `#1: ${x} ${y}`
	}
}