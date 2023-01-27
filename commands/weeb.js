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
		prompt.shift()
		prompt = prompt.toString()
		console.log(prompt)
		var payload = {
			"prompt": "maltese puppy",
			"steps": 5
		}
	}
}