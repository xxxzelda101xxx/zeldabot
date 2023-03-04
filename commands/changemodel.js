const axios = require('axios')
const config = require('../config.json')
const url = config.ai.url

module.exports = {
	name: "changemodel",
	aliases: ["cm"],
	description: "Changes the model for stable diffusion.",
	canWhisper: false,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, args) {
        const request = await axios.get(`${url}/sdapi/v1/sd-models`)
        var data = request.data
        if (args.length == 1) {
            var modelsArray = []
            for (var i = 0; i < data.length; i++) {
                modelsArray.push(`[${i + 1}] ${data[i].model_name}`)
            }
            return modelsArray
        }
        else if (args.length == 2 && !isNaN(args[1]) && args[1] > 0 && args[1] <= data.length) {
            const request2 = await axios.post(`${url}/sdapi/v1/options`, { sd_model_checkpoint: data[args[1] - 1].title})
            return `Changed model to ${data[args[1] - 1].model_name}`
        }
		return "dejj"
	}
}