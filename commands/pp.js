module.exports = {
	name: "pp",
	aliases: ["nppp"],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	execute: async function(channel, user, msg, context, chatClient, data) {
		if (msg.toLowerCase().split(" ").length == 1) {
			var pp = await data.getCurrentPP()
			if (channel) {
				chatClient.say(channel, `${pp}pp`)
			}
			else {
				chatClient.whisper(user, `${pp}pp`)
			}
		}
		else if (msg.toLowerCase().split(" ").length > 1 && !isNaN(msg.toLowerCase().split(" ")[1])) {
			var mods, accuracy
			if (msg.indexOf("+") > -1) {
				var msgArray = msg.split(" ")
				for (var i = 0; i < msgArray.length; i++) {
					if (msgArray[i].indexOf("+") > -1) {
						mods = msgArray[i].substring(1)
						if (i == 1) accuracy = Number(msg.toLowerCase().split(" ")[2]).toFixed(2)
						else accuracy = Number(msg.toLowerCase().split(" ")[1]).toFixed(2)
					}
				}
			}
			console.log(accuracy, mods)
			if (msg.indexOf("+") < 0) accuracy = Number(msg.toLowerCase().split(" ")[1]).toFixed(2)
			var [pp, count100] = await data.getPPCustom(accuracy, mods)
			if (count100 == 0) accuracy = 100
			if (channel) {
				chatClient.say(channel, `${pp}pp for a ${accuracy}% (${count100}x100) ${mods} fc.`)
			}
			else {
				chatClient.whisper(user, `${pp}pp for a ${accuracy}% (${count100}x100) ${mods} fc.`)
			}
		}
	}
}