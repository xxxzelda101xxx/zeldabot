import * as osu from "osu-api-v2-js"
import config from '../config.json' assert { type: "json" }
import { getOsuUsername } from "../database.js"
import { lastMap } from "../handlers/messagehandler.js"

export default {
	name: "osurecent",
	description: "",
	canWhisper: true,
	execute: async function(msg, context, args, alias) {
        const api = await osu.API.createAsync({id: config.osu.client_id, secret: config.osu.client_secret})
        var scoreIndex
        if (alias) scoreIndex = parseInt(msg.substring(alias.length + 1).trim().toLowerCase().split(" ")[0])
        else scoreIndex = parseInt(msg.substring(10).trim().toLowerCase().split(" ")[0])
        if (isNaN(scoreIndex)) scoreIndex = 1
        var username
        if (msg.toLowerCase().split(" ").length == 1) username = await getOsuUsername(context.userInfo.userId)
        else username = msg.toLowerCase().split(" ")[1]
        if (username == "" || username == null) return "Please set your osu! username using !osulink <osu! username>!"
        const user = await api.getUser(username)
        if (scoreIndex > 50) return "You can't have more than 50 recent plays!"
        const score = (await api.getUserScores(user, "recent", osu.Ruleset.osu, {fails: true, lazer: true}, {limit: scoreIndex}))[scoreIndex - 1]
        if (!score) return "User has no recent scores!"
        const beatmapDifficulty = await api.getBeatmapDifficultyAttributesOsu(score.beatmap, score.mods) // Specifying the mods so the SR is adapted to them
        lastMap[context.channelId] = score.beatmap.id
        var pp
        if (score.pp != null) pp = `${score.pp.toFixed(2)}pp `
        else pp = ""
        var mods = `+${score.mods.toString()} `
        if (mods == "+ ") mods = ""

        const x = `${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}]`
        const y = `${mods}${(score.accuracy * 100).toFixed(2)}% ${pp}(${beatmapDifficulty.star_rating.toFixed(2)}*)`
        return `${x} ${y} - https://osu.ppy.sh/b/${score.beatmap.id}`
	}
}