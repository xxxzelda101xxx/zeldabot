const axios = require('axios')
const fs = require('fs')
const { nanoid } = require('nanoid')
const config = require('../config.json')
const url = config.ai.url

module.exports = {
	name: "weeb",
	aliases: [],
	description: "",
	canWhisper: false,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, data) {
		var file_id = nanoid()
		var prompt = msg.split(" ")
		prompt.shift()
		prompt = prompt.toString()
		prompt = prompt.replace(/completely nude/g, "").replace(/nude/g, "").replace(/sex/g, "").replace(/cum/g, "").replace(/anal/g, "").replace(/anus/g, "").replace(/vagina/g, "").replace(/pussy/g, "").replace(/asshole/g, "").replace(/penis/g, "")
		console.log(prompt)
		var payload = {
			"prompt": prompt,
			"negative_prompt": "lowres, bad anatomy, ((bad hands)), text, error, ((missing fingers)), cropped, jpeg artifacts, worst quality, low quality, signature, watermark, blurry, deformed, extra ears, deformed, disfigured, mutation, censored, (((nude))), (((sex))), (((cum)))",
			"steps": 20,
			"width": 448,
			"height": 640
		}
		const request = await axios.post(`${url}/sdapi/v1/txt2img`, payload)
		.catch (e => {
			console.log(e)
		})
		let image = await request.data.images
		fs.writeFileSync(`./images/${file_id}.png`, image[0], 'base64', function(err) {
			console.log(err);
		});
		return `https://blameseouless.com/aiimages/${file_id}.png`
	}
}