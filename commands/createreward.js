const { shigeapiClient } = require("../utils/apiclient")

module.exports = {
	name: "createreward",
	aliases: [],
	description: "",
	canWhisper: false,
	isOsuCommand: false,
	adminOnly: true, 
	isPublic: false,
	execute: async function(msg) {
		let user = await shigeapiClient.users.getUserByName("shigetora")
		const cost = msg.split(" ")[1]
		const prompt = msg.match(/\(([^)]+)\)/)[1]
		const title = msg.match(/\[([^)]+)\]/)[1]
		const rewards = await shigeapiClient.channelPoints.createCustomReward(user, { cost: cost, prompt: prompt, title: title })
		.catch(e => {
			throw new Error(e)
		})
		return `Created award ${title} with a cost of ${cost} channel points!`
	}
}