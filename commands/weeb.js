const axios = require('axios')

module.exports = {
	name: "weeb",
	aliases: [],
	description: "",
	canWhisper: true,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, data) {
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
		const request = await axios.post("http://127.0.0.1:7860/sdapi/v1/txt2img", {
            prompt: payload,
        });
		let image = await request.data.images
		console.log(request)
	}
}