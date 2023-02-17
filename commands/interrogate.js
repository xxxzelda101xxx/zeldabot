const axios = require('axios')
const fs = require('fs')
const config = require('../config.json')
const url = config.ai.url

module.exports = {
	name: "interrogate",
	aliases: [],
	description: "",
	canWhisper: false,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, data, channel) {
		const imageRegex = /((?:(?!(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)).)+)|((?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)(?:\?\S+=\S*(?:&\S+=\S*)*)?)/g;
		const result = msg.match(imageRegex)
		let image = await axios.get(result[1], {responseType: 'arraybuffer'});
		let test = Buffer.from(image.data, 'binary').toString('base64')
		const payload = {
			"image": test,
  			"model": "deepbooru"
		}
		const request = await axios.post(`${url}/sdapi/v1/interrogate`, payload)
		.catch(e =>{
			console.log(e)
		})
		var data = await request.data.info
		data = JSON.parse(data)
		console.log(data)
		return string
	}
}