const axios = require('axios')
const config = require('../config.json')
const url = config.ai.url

module.exports = {
	name: "weeb",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, data) {
		console.log(`${url}/sdapi/v1/txt2img`)
		var prompt = msg.split(" ")
		prompt.shift()
		prompt = prompt.toString()
		prompt = prompt.replace(/completely nude/g, "").replace(/nude/g, "").replace(/sex/g, "").replace(/cum/g, "").replace(/anal/g, "").replace(/anus/g, "").replace(/vagina/g, "").replace(/pussy/g, "").replace(/asshole/g, "").replace(/penis/g, "")
		console.log(prompt)
		var payload = {
			"prompt": prompt,
			"negative_prompt": "bed",
			"steps": 20,
			"width": 448,
			"height": 640
		}
		const request = await axios.post(`${url}/sdapi/v1/txt2img`, payload)
		.catch (e => {
			console.log(e)
		})
		let image = await request.data.images
		console.log(request)
	}
}