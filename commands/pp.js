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
		else if (msg.toLowerCase().split(" ").length > 1 && msg.toLowerCase().split(" ").length < 4) {
			var mods = "", accuracy
			if (msg.indexOf("+") > -1) {
				var msgArray = msg.split(" ")
				for (var i = 0; i < msgArray.length; i++) {
					if (msgArray[i].indexOf("+") > -1) {
						mods = msgArray[i].substring(1).toLowerCase()
						if (msgArray.length == 2) accuracy = 100
						else if (i == 1) accuracy = Number(msg.toLowerCase().split(" ")[2]).toFixed(2)
						else accuracy = Number(msg.toLowerCase().split(" ")[1]).toFixed(2)
					}
				}
			}
			var valid_mods = ["nf", "ez", "td", "hd", "hr", "ht", "dt", "nc", "fl", "so"]
			var selected_mods = mods.match(/.{1,2}/g)
			var fixed_mods_string = ""

			for (var i = 0; i < selected_mods.length; i++) {
				console.log(selected_mods[i])
				const result = valid_mods.filter(mod => {
					console.log(mod)
					mod.indexOf(selected_mods[i] > -1)
				})
				console.log(result)
				if (result.length > 0) fixed_mods_string += result[0]
			}

			if (msg.indexOf("+") < 0) accuracy = Number(msg.toLowerCase().split(" ")[1]).toFixed(2)
			var [pp, count100] = await data.getPPCustom(accuracy, mods)
			if (count100 == 0) accuracy = 100
			if (channel) {
				chatClient.say(channel, `${pp}pp for a ${accuracy}% (${count100}x100) ${fixed_mods_string.toUpperCase()} fc.`)
			}
			else {
				chatClient.whisper(user, `${pp}pp for a ${accuracy}% (${count100}x100) ${fixed_mods_string.toUpperCase()} fc.`)
			}
		}
		else {
			if (channel) {
				chatClient.say(channel, "Invalid command usage. Example usage: \"!pp +HDHR 100")
			}
			else {
				chatClient.whisper(user, "Invalid command usage. Example usage: \"!pp +HDHR 100")
			}
		}
	}
}