import axios from 'axios'
import fs from 'fs'
import config from '../config.json' assert { type: "json" }
const url = config.ai.url
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken

export default {
	name: "interrogate",
	aliases: [],
	description: "Returns tags from stable diffusion's interrogate feature for a given image.",
	canWhisper: false,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, args) {
		if (!useSeparateBroadcasterToken) return ""
		const imageRegex = /((?:(?!(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)).)+)|((?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)(?:\?\S+=\S*(?:&\S+=\S*)*)?)/g;
		const result = msg.match(imageRegex)
		let image = await axios.get(result[1], {responseType: 'arraybuffer'});
		let test = Buffer.from(image.data, 'binary').toString('base64')
		const payload = {
			"image": test,
  			"model": "deepdanbooru"
		}
		const request = await axios.post(`${url}/sdapi/v1/interrogate`, payload)
		.catch(e =>{
			console.log(e)
		})
		var data = await request.data.caption
		data = data.replace(/_/gi, " ")
		return data
	}
}