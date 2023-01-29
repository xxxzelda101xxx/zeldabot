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
		var prompt = msg.substr(6)
		var steps = 0
		if (prompt.indexOf("--steps") == 0 && prompt.indexOf("--steps") == 0) {
			steps = prompt.split(" ")[1]
			prompt = prompt.substr(8 + prompt.split(" ")[1].length + 1)
		}
		//prompt = prompt.replace(/completely nude/g, "").replace(/nude/g, "").replace(/sex/g, "").replace(/cum/g, "").replace(/anal/g, "").replace(/anus/g, "").replace(/vagina/g, "").replace(/pussy/g, "").replace(/asshole/g, "").replace(/penis/g, "").replace(/nipples/g, "")
		var payload = {
			"prompt": prompt,
			"negative_prompt": "lowres, bad anatomy, ((bad hands)), text, error, ((missing fingers)), cropped, jpeg artifacts, worst quality, low quality, signature, watermark, blurry, deformed, extra ears, deformed, (((disfigured))), mutation, censored",
			"steps": steps > 0 ? steps : 100,
			"width": 448,
			"height": 640,
			"sampler_index": "Euler a",
		}
		const request = await axios.post(`${url}/sdapi/v1/txt2img`, payload)
		let image = await request.data.images
		var data = await request.data.info
		data = JSON.parse(data)
		fs.writeFileSync(`./images/${file_id}.png`, image[0], 'base64', function(err) {
			console.log(err);
		});
		return `https://blameseouless.com/aiimages/${file_id}.png`
	}
}