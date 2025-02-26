import * as osu from "osu-api-v2-js"
import config from '../config.json' with { type: "json" }
import { getOsuUsername } from "../database.js"
import { lastMap } from "../handlers/messagehandler.js"

export default {
	name: "osutop",
	description: "",
	canWhisper: true,
	execute: async function(msg, context, args, alias) {
        const api = await osu.API.createAsync(config.osu.client_id, config.osu.client_secret)
        var scoreIndex
        if (alias) scoreIndex = parseInt(msg.substring(alias.length).trim().toLowerCase().split(" ")[0])
        else scoreIndex = parseInt(msg.substring(5).trim().toLowerCase().split(" ")[0])
        console.log(scoreIndex)
        console.log(msg.substring(1).trim().toLowerCase().split(" ")[0])
        console.log(msg.substring(2).trim().toLowerCase().split(" ")[0])
        console.log(msg.substring(3).trim().toLowerCase().split(" ")[0])
        console.log(msg.substring(4).trim().toLowerCase().split(" ")[0])
        console.log(msg.substring(5).trim().toLowerCase().split(" ")[0])
        console.log(msg.substring(6).trim().toLowerCase().split(" ")[0])
        if (isNaN(scoreIndex)) scoreIndex = 1
        var username
        if (msg.toLowerCase().split(" ").length == 1) username = await getOsuUsername(context.userInfo.userId)
        else username = msg.toLowerCase().split(" ")[1]
        if (username == "" || username == null) return "Please set your osu! username using !osulink <osu! username>!"
        const user = await api.getUser(username)
        if (scoreIndex > 100) return "You can't have more than 100 top plays!"
        const score = (await api.getUserScores(user, "best", osu.Ruleset.osu, {lazer: false}, {limit: scoreIndex}))[scoreIndex - 1]
        const beatmapDifficulty = await api.getBeatmapDifficultyAttributesOsu(score.beatmap, score.mods) // Specifying the mods so the SR is adapted to them
        lastMap[context.channelId] = score.beatmap.id
        console.log(score.mods[0].acronym)
        var pp
        if (score.pp != null) pp = `${score.pp.toFixed(2)}pp `
        else pp = ""
        var mods = `+`
        for (var i = 0; i < score.mods.length; i++) {
                console.log(score.mods[i])
                mods += score.mods[i].acronym
        }
        if (mods == "+ ") mods = ""

        const x = `${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}]`
        const y = `${mods} ${(score.accuracy * 100).toFixed(2)}% ${pp}(${beatmapDifficulty.star_rating.toFixed(2)}*)`
        return `#${scoreIndex}: ${x} ${y} - https://osu.ppy.sh/b/${score.beatmap.id}`
	}
}