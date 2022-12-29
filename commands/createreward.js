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
		console.log(cost)
		console.log(prompt)
		console.log(title)
		//const rewards = await shigeapiClient.channelPoints.createCustomReward(user, data)
	}
}