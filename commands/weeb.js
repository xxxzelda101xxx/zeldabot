const axios = require('axios')
const fs = require('fs')
const { nanoid } = require('nanoid')
const config = require('../config.json')
const url = config.ai.url
const { joinImages } = require('join-images')
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken

module.exports = {
	name: "weeb",
	aliases: [],
	description: "Generates an image using AI.",
	canWhisper: false,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, args) {
		if (!useSeparateBroadcasterToken) return ""
		if (context.channelId != 14163149) return ""
		var prompt = msg.substr(6)
		var steps = 50
		var width = 384
		var height = 512
		var hires_steps = 20
		var hr_scale = 2
		var enable_hr = true
		var batch_size = 1
		var override_settings= {}
		if (prompt.indexOf("--steps") == 0) {
			steps = prompt.split(" ")[1]
			prompt = prompt.substr(8 + prompt.split(" ")[1].length + 1)
		}
		
		if (prompt.indexOf("--batch") > -1) {
			batch_size = 8
			hr_scale = 1
		}

		if (prompt.indexOf("--3d") > -1) {
			override_settings = {
				"sd_model_checkpoint": "realisticVisionV13_v13.safetensors [c35782bad8]"
			}
		}
		if (prompt.indexOf("hitori gotou") > -1 || prompt.indexOf("hitori goto") > -1) {
			prompt = " <lora:hitoriGotohBocchiThe_v1:1>, hair ornament, cube hair ornament, blue eyes, pink long hair, pink track jacket, bangs, hair between eyes, " + prompt
		}
		if (prompt.indexOf("aqua \\(konosuba\\)") > -1) {
			prompt = "<lora:aquaKonosubaLora_1:0.6>, " + prompt
		}
		if (prompt.indexOf("ru_qun") > -1) {
			prompt = "<lora:elegantHanfuRuqun_v10:1>, " + prompt
		}
		if (prompt.indexOf("chibi") > -1) {
			prompt = " <lora:komowataHarukaChibiArt_v20:1>, chibi, " + prompt
		}
		prompt = prompt.replace(/--hq/gi, "")
		prompt = prompt.replace(/--batch/gi, "")
		prompt = prompt.replace(/--3d/gi, "")
		console.log(prompt)
		var payload = {
			"prompt": "(((best quality))), (((masterpiece))), " + prompt,
			"negative_prompt": "(((deformed))), blurry, bad anatomy, disfigured, poorly drawn face, mutation, mutated, (extra_limb), (ugly), (poorly drawn hands), fused fingers, messy drawing, broken legs censor, censored, censor_bar, multiple breasts, (mutated hands and fingers:1.5), (long body :1.3), (mutation, poorly drawn :1.2), black-white, bad anatomy, liquid body, liquidtongue, disfigured, malformed, mutated, anatomical nonsense, text font ui, error, malformed hands, long neck, blurred, lowers, low res, bad anatomy, bad proportions, bad shadow, uncoordinated body, unnatural body, fused breasts, bad breasts, huge breasts, poorly drawn breasts, extra breasts, liquid breasts, heavy breasts, missingbreasts, huge haunch, huge thighs, huge calf, bad hands, fused hand, missing hand, disappearing arms, disappearing thigh, disappearing calf, disappearing legs, fusedears, bad ears, poorly drawn ears, extra ears, liquid ears, heavy ears, missing ears, fused animal ears, bad animal ears, poorly drawn animal ears, extra animal ears, liquidanimal ears, heavy animal ears, missing animal ears, text, ui, error, missing fingers, missing limb, fused fingers, one hand with more than 5 fingers, one hand with less than5 fingers, one hand with more than 5 digit, one hand with less than 5 digit, extra digit, fewer digits, fused digit, missing digit, bad digit, liquid digit, colorful tongue, blacktongue, cropped, watermark, username, blurry, JPEG artifacts, signature, 3D, 3D game, 3D game scene, 3D character, malformed feet, extra feet, bad feet, poorly drawnfeet, fused feet, missing feet, extra shoes, bad shoes, fused shoes, more than two shoes, poorly drawn shoes, bad gloves, poorly drawn gloves, fused gloves, bad cum, poorly drawn cum, fused cum, bad hairs, poorly drawn hairs, fused hairs, big muscles, ugly, bad face, fused face, poorly drawn face, cloned face, big face, long face, badeyes, fused eyes poorly drawn eyes, extra eyes, malformed limbs, more than 2 nipples, missing nipples, different nipples, fused nipples, bad nipples, poorly drawnnipples, black nipples, colorful nipples, gross proportions. short arm, (((missing arms))), missing thighs, missing calf, missing legs, mutation, duplicate, morbid, mutilated, poorly drawn hands, more than 1 left hand, more than 1 right hand, deformed, (blurry), disfigured, missing legs, extra arms, extra thighs, more than 2 thighs, extra calf,fused calf, extra legs, bad knee, extra knee, more than 2 legs, bad tails, bad mouth, fused mouth, poorly drawn mouth, bad tongue, tongue within mouth, too longtongue, black tongue, big mouth, cracked mouth, bad mouth, dirty face, dirty teeth, dirty pantie, fused pantie, poorly drawn pantie, fused cloth, poorly drawn cloth, badpantie, yellow teeth, thick lips, bad camel toe, colorful camel toe, bad asshole, poorly drawn asshole, fused asshole, missing asshole, bad anus, bad pussy, bad crotch, badcrotch seam, fused anus, fused pussy, fused anus, fused crotch, poorly drawn crotch, fused seam, poorly drawn anus, poorly drawn pussy, poorly drawn crotch, poorlydrawn crotch seam, bad thigh gap, missing thigh gap, fused thigh gap, liquid thigh gap, poorly drawn thigh gap, poorly drawn anus, bad collarbone, fused collarbone, missing collarbone, liquid collarbone, strong girl, obesity, normal quality, liquid tentacles, bad tentacles, poorly drawn tentacles, split tentacles, fused tentacles, missing clit, bad clit, fused clit, colorful clit, black clit, liquid clit, QR code, bar code, censored, safety panties, safety knickers, mosaic, testis, (worst quality, low quality:1.4), hands",
			"steps": steps > 0 ? steps : 50,
			"width": width,
			"height": height,
			"sampler_index": "DPM++ SDE Karras",
			"enable_hr": enable_hr,
			"hr_upscaler": "R-ESRGAN 4x+ Anime6B",
			"hr_second_pass_steps": hires_steps,
			"hr_scale": hr_scale,
			"denoising_strength": 0.7,
			"override_settings": override_settings,
			"cfg_scale": 8.5,
			"batch_size": batch_size
		}
		const request = await axios.post(`${url}/sdapi/v1/txt2img`, payload)
		let image = await request.data.images
		var data = await request.data.info
		data = JSON.parse(data)
		if (batch_size == 1){
			let file_id = nanoid()
			fs.writeFileSync(`./images/${file_id}.png`, image[0], 'base64', function(err) {
				console.log(err);
			});
			return `https://blameseouless.com/aiimages/${file_id}.png`
		} 
		else {
			let file_id = nanoid()
			var imageArray = []
			for (var i = 0; i < image.length; i++) {
				var imageBuffer = Buffer.from(image[i], 'base64')
				imageArray.push(imageBuffer)
			}
			joinImages(imageArray).then((img) => {
				img.toFile(`./images/${file_id}.png`);
			});
			return `https://blameseouless.com/aiimages/${file_id}.png`
		}
	}
}