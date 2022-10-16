const config = require("../config.json")
module.exports = {
	name: "scorepost",
	aliases: [""],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	requiredState: 7,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var results = data.getResultsScreen()
		var pp = await data.getCurrentPP()
		var newSR = await data.getNewSR()
		var scorepostString = `${data.getResultsPlayerName()} | ${data.getArtist()} - ${data.getTitle()} [${data.getDifficulty()}] +${data.getMods()} (${data.getMapper()}, ${newSR}★) ${data.getAccuracy()}% `
		if (data.resultsScreen["0"] > 0) scorepostString += `${results["0"]}xmiss `
		scorepostString += `| ${pp}pp `
		if (data.getUR() > 0) scorepostString += `| ${data.unstableRate} ur`
		if (channel) {
			chatClient.say(channel, scorepostString)
		}
		else {
			chatClient.whisper(user, scorepostString)
		}
	}
}