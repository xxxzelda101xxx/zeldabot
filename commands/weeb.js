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
		//prompt = prompt.replace(/completely nude/g, "").replace(/nude/g, "").replace(/sex/g, "").replace(/cum/g, "").replace(/anal/g, "").replace(/anus/g, "").replace(/vagina/g, "").replace(/pussy/g, "").replace(/asshole/g, "").replace(/penis/g, "").replace(/nipples/g, "")
		var payload = {
			"prompt": prompt.replace(/,/g, " "),
			"negative_prompt": "lowres, bad anatomy, ((bad hands)), text, error, ((missing fingers)), cropped, jpeg artifacts, worst quality, low quality, signature, watermark, blurry, deformed, extra ears, deformed, disfigured, mutation, censored",
			"steps": 20,
			"width": 896,
			"height": 1280,
			"sampler_index": "DPM++ 2S a Karras",
		}
		const request = await axios.post(`${url}/sdapi/v1/txt2img`, payload)
		.catch (e => {
			console.log(e)
		})
		let image = await request.data.images
		var data = await request.data.info
		data = JSON.parse(data)
		console.log(data.seed)
		fs.writeFileSync(`./images/${file_id}.png`, image[0], 'base64', function(err) {
			console.log(err);
		});
		return `https://blameseouless.com/aiimages/${file_id}.png`
	}
}