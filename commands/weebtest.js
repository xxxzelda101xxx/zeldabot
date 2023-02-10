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
		let image = await axios.get('https://cdn.donmai.us/sample/93/37/__raiden_shogun_and_yae_miko_genshin_impact_drawn_by_niliu_chahui__sample-9337e38d12eb7df6f3b227fe01fa8b38.jpg', {responseType: 'arraybuffer'});
		let test = Buffer.from(image.data).toString('base64');
		const payload = {
			"init_images": test
		}
		const request = await axios.post(`${url}/sdapi/v1/txt2img`, payload)
		let images = await request.data.images
		var data = await request.data.info
	}
}