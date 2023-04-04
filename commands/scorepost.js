export default {
	name: "scorepost",
	aliases: [],
	description: "Meme command to generate a reddit score post title.",
	canWhisper: true,
	isOsuCommand: true,
	requiredState: 7,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		var results = data.getResultsScreen()
		var pp = await data.getCurrentPP()
		var newSR = await data.getNewSR()
		var scorepostString = `${data.getResultsPlayerName()} | ${data.getArtist()} - ${data.getTitle()} [${data.getDifficulty()}] +${data.getMods()} (${data.getMapper()}, ${newSR}★) ${data.getAccuracy()}% `
		if (data.resultsScreen["0"] > 0) scorepostString += `${results["0"]}xmiss `
		scorepostString += `| ${pp}pp `
		if (data.getUR() > 0) scorepostString += `| ${data.getUR()} ur`
		return scorepostString
	}
}