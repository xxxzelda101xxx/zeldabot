module.exports = {
	name: "roll",
	description: "Roll a dice.",
	canWhisper: true,
	isOsuCommand: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var numberToRoll = msg.split(" ").filter(item => item)
		console.log(numberToRoll)
		numberToRoll = numberToRoll[1]
		console.log(numberToRoll)
		var maxDice = 6
		if (!isNaN(numberToRoll) && numberToRoll > 0) maxDice = numberToRoll
		var randomDice = Math.floor(maxDice*Math.random()) + 1
		chatClient.say(channel, randomDice)
	}
}