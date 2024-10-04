const dlUrl = "https://osu.ppy.sh/b/"
const dlSetUrl = "https://osu.ppy.sh/s/"
//import { BeatmapDecoder } from 'osu-parsers'
//import path from "path"
//import config from "../config.json" with { type: "json" }
//const songsFolder = config.osu.Songs_folder


export default {
	name: "np",
	aliases: ["map", "song"],
	description: "Sends information on the song/map that is currently playing.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: true,
	execute: async function(msg, context, data, args) {
		//contents = `${mapData.artist} - ${mapData.title} [${mapData.difficulty}] +${osuMods} (${rankedStatus}, Mapset by ${mapData.mapper}) Download: `
		var contents = `${data.getArtist()} - ${data.getTitle()} [${data.getDifficulty()}] +${data.getMods()} `
		if (data.beatmap_id == 0 && data.beatmapset_id > 0) {
			contents +=`${dlSetUrl}${data.beatmapset_id}`
		}
		else if (data.beatmapset_id == -1) {
			contents +="ping zelda for link"
		}
		//else if (data.beatmapset_id == -1) {
		//	var osuFile = path.join(songsFolder, data.menu.bm.path.folder, data.menu.bm.path.file)
		//	var files = fs.readdirSync(path.join(songsFolder, data.menu.bm.path.folder))
		//	console.log(`osuFile = ${osuFile}`)
		//	for(var i in files) {
		//		console.log(path.basename(files[i]))
		//		console.log(`files[i] = ${files[i]}`)
		//		if(path.extname(files[i]) === ".osu" && path.basename(files[i]) != data.menu.bm.path.file) {
		//			const decoder = new BeatmapDecoder()
		//			const submittedOsuFile = path.join(songsFolder, data.menu.bm.path.folder, files[i])
		//			console.log(`submittedOsuFile = ${submittedOsuFile}`)
		//			const map = await decoder.decodeFromPath()
		//			contents +=`${dlSetUrl}${map.metadata.beatmapSetId} `
		//			break;
		//		}
		//	 }
		//}
		else {
			contents +=`${dlUrl}${data.beatmap_id}`
		}
		return contents
	}
}