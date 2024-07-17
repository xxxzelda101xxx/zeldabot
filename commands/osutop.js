import * as osu from "osu-api-v2-js"
import config from '../config.json' assert { type: "json" }

export default {
	name: "osutop",
	description: "",
	canWhisper: true,
	execute: async function(msg, context, data, args) {
        const api = await osu.API.createAsync({id: config.osu.client_id, secret: config.osu.client_secret})
        const username = "zelda101"
        const user = await api.getUser(username)
        const score = (await api.getUserScores(user, "best", osu.Ruleset.osu, {lazer: false}, {limit: 2}))[1] // Specifying the Ruleset is optional
        const beatmapDifficulty = await api.getBeatmapDifficultyAttributesOsu(score.beatmap, score.mods) // Specifying the mods so the SR is adapted to them
    
        const x = `${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}]`
        const y = `+${score.mods.toString()} ${(score.accuracy * 100).toFixed(2)}% (${beatmapDifficulty.star_rating.toFixed(2)}*)`
        console.log(`${username}'s top play is on: ${x} ${y}`)
        // Doomsday fanboy's top play is on: Yamajet feat. Hiura Masako - Sunglow [Harmony] +DT (8.72*)
	}
}