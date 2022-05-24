module.exports = {
	name: "pp",
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
		else if (msg.toLowerCase().split(" ").length == 2 && !isNaN(msg.toLowerCase().split(" ")[1])) {
			var accuracy = Number(msg.toLowerCase().split(" ")[1]).toFixed(2)
			var [pp, count100] = await data.getPPCustom(accuracy)
			if (count100 == 0) accuracy = 100
			if (channel) {
				chatClient.say(channel, `${pp}pp for a ${accuracy}% (${count100}x100) fc.`)
			}
			else {
				chatClient.whisper(user, `${pp}pp for a ${accuracy}% (${count100}x100) fc.`)
			}
		}
	}
}