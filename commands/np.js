const dlUrl = "https://osu.ppy.sh/b/"
const dlSetUrl = "https://osu.ppy.sh/s/"
module.exports = {
	name: "np",
	description: "Sends information on the song/map that is currently playing.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: true,
	execute: async function(channel, user, msg, context, chatClient, data) {
		//contents = `${mapData.artist} - ${mapData.title} [${mapData.difficulty}] +${osuMods} (${rankedStatus}, Mapset by ${mapData.mapper}) Download: `
		var contents = `${data.getArtist()} - ${data.getTitle()} [${data.getDifficulty()}] `
		console.log("x" + data.getMods() + "x")
		if (data.getMods() != "") { 
			contents += `+${data.getMods()}`
		}
		if (data.beatmap_id == 0 && data.beatmapset_id > 0) {
			contents +=`${dlSetUrl}${data.beatmapset_id}`
		}
		else if (data.beatmapset_id == -1) {
			contents +="ping zelda for link"
		}
		else {
			contents +=`${dlUrl}${data.beatmap_id}`
		}
		if (channel) {
			chatClient.say(channel, contents)
		}
		else {
			chatClient.whisper(user, contents)
		}
	}
}