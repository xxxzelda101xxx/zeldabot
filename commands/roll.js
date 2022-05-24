module.exports = {
	name: "roll",
	description: "Roll a dice.",
	canWhisper: true,
	isOsuCommand: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var maxDice = 6
		if (!isNaN(msg.split(" ")[1]) && msg.split(" ")[1] > 1) maxDice = msg.split(" ")[1]
		var randomDice = Math.floor(maxDice*Math.random()) + 1
		chatClient.say(channel, randomDice)
	}
}