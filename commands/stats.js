module.exports = {
	name: "stats",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var newSR = await data.getNewSR()
		if (channel) {
			chatClient.say(channel, `New SR: ${newSR}★, Old SR: ${data.getSR()}★, ${data.getLength()}, ${data.getBpm()}bpm,  AR${data.getAR()}, CS${data.getCS()}, OD${data.getOD()}, HP${data.getHP()}`)
		}
		else {
			chatClient.whisper(user, `New SR: ${newSR}★, Old SR: ${data.getSR()}★, ${data.getLength()}, ${data.getBpm()}bpm,  AR${data.getAR()}, CS${data.getCS()}, OD${data.getOD()}, HP${data.getHP()}`)
		}
	}
}