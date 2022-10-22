const { changeTwitchStreamStatus } = require("./database.js")
//const { logger } = require("./logger.js")
const { apiClient } = require("./utils/apiclient")
//const { exec } = require("child_process")
//var ffi = require("ffi-napi")
const { chatClient } = require("./utils/chatclient.js")

/*function getOsuWindowTitle() {
	return new Promise(function(resolve){
		exec("tasklist /fi \"imagename eq osu!.exe\" /fo list /v", { windowsHide: true }, async function(err, stdout, stderr) {
			var data = stdout.split("\n")
			data = data[9].substring(14)
			resolve(data.trim())
		})
	})
}*/

async function isStreamOnline(channel, firstRun) {
	if (firstRun) {
		setTimeout(() => {
			isStreamOnline(channel, false)
		}, 60000)
		return
	}
	var stream = await apiClient.streams.getStreamByUserName(channel)
	if (stream) {
		changeTwitchStreamStatus(stream.userId, true)
	}
	else {
		var user = await apiClient.users.getUserByName(channel)
		changeTwitchStreamStatus(user.id, false)
	}
	setTimeout(() => {
		isStreamOnline(channel, false)
	}, 60000)
}

async function kagamiBanRNG(channel, user) {
	var randomNumber = Math.floor(Math.random() * 1001)
	if (randomNumber == 727) {
		await chatClient.say(channel, "Kagami_77 hit the 1/1000 chance to get banned lmao.")
		await chatClient.ban(channel, user, "You hit the 1/1000 chance lmao get rekt")
	}
}

async function banRNG(channel, user, context) {
	var randomNumber = Math.floor(Math.random() * 10000 + 1)
	var randomNumber2 = Math.floor(Math.random() * 1000000 + 1)
	var randomNumber3 = Math.floor(Math.random() * 10 + 1)
	if (randomNumber == 727 || randomNumber2 == 727) {
		if (context.userInfo.isBroadcaster) {
			await chatClient.say(channel, `Somehow shige hit the ${randomNumber == 727 ? "1/10,000" : "1/1,000,000"} chance to get banned? Is that good luck or bad luck?`)
		}
		else if (context.userInfo.isMod) {
			await chatClient.say(channel, `${user} hit the ${randomNumber == 727 ? "1/10,000" : "1/1,000,000"} chance to get banned but is immune. smh.... shigeSumika`)
		}
		else {
			await chatClient.say(channel, `${user} hit the ${randomNumber == 727 ? "1/10,000 " : "1/1,000,000 chance to get banned. how the fuck???."}`)
			await chatClient.ban(channel, user, `You hit the ${randomNumber == 727 ? "1/10,000 chance to get banned get rekt lmao." : "1/1,000,000 chance to get banned. how the fuck???"}`)
		}
	}
	else if (randomNumber3 == 5) {
		await chatClient.say(channel, `Congrats you hit a 1/10 chance!`)
	}
}

module.exports.banRNG = banRNG
module.exports.kagamiBanRNG = kagamiBanRNG
module.exports.isStreamOnline = isStreamOnline