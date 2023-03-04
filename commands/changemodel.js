const axios = require('axios')
const config = require('../config.json')
const url = config.ai.url

module.exports = {
	name: "changemodel",
	aliases: [],
	description: "Changes the model for stable diffusion.",
	canWhisper: false,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, args) {
        if (args.length == 1) {
            const request = await axios.get(`${url}/sdapi/v1/sd-models`)
            console.log(request)
        }
		return ""
	}
}