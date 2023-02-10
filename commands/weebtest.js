const axios = require('axios')
const fs = require('fs')
const { nanoid } = require('nanoid')
const config = require('../config.json')
const url = config.ai.url

module.exports = {
	name: "weebtest",
	aliases: [],
	description: "",
	canWhisper: false,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, data, channel) {
		let file_id = nanoid()
		var steps = 50
		var width = 512
		var height = 512
		let image = await axios.get('https://www.blameseouless.com/files/GRri4m.jpg', {responseType: 'arraybuffer'});
		let test = Buffer.from(image.data).toString('base64');
		const payload = {
			"steps": steps,
			"width": width,
			"height": height,
			"init_images": test,
			"sampler_index": "DDIM",
			"denoising_strength": 0.7,
			"cfg_scale": 12,

		}
		const request = await axios.post(`${url}/sdapi/v1/txt2img`, payload)
		var data = await request.data.info
		data = JSON.parse(data)
		let images = await request.data.images
		console.log(images[0])
		fs.writeFileSync(`./images/${file_id}.png`, image[0], 'base64', function(err) {
			console.log(err);
		});
		return `https://blameseouless.com/aiimages/${file_id}.png`
	}
}