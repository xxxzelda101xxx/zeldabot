const axios = require('axios')

module.exports = {
	name: "weeb",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, data) {
		var prompt = msg.split(" ")
		console.log(prompt.shift())
		var payload = {
			"prompt": "maltese puppy",
			"steps": 5
		}
	}
}