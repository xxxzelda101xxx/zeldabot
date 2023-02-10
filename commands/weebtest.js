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
		let image = await axios.get('https://cdn.donmai.us/sample/87/68/__raiden_shogun_genshin_impact_drawn_by_houkisei__sample-8768552db0c40f6398916158c24d192f.jpg', {responseType: 'arraybuffer'});
		let test = Buffer.from(image.data).toString('base64');
		const payload = {
			"init_images": test
		}
		const request = await axios.post(`${url}/sdapi/v1/txt2img`, payload)
		var data = await request.data.info
		data = JSON.parse(data)
		let images = await request.data.images
		console.log(data)
		fs.writeFileSync(`./images/${file_id}.png`,  parseInt(image[0], 10).toString(), 'base64', function(err) {
			console.log(err);
		});
		return `https://blameseouless.com/aiimages/${file_id}.png`
	}
}