const dlUrl = "https://osu.ppy.sh/b/"
const dlSetUrl = "https://osu.ppy.sh/s/"
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
		else {
			contents +=`${dlUrl}${data.beatmap_id}`
		}
		return contents
	}
}