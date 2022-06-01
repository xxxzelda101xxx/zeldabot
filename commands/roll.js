module.exports = {
	name: "roll",
	description: "Roll a dice.",
	canWhisper: true,
	isOsuCommand: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var numberToRoll = msg.split(" ").filter(item => item)
		numberToRoll = numberToRoll[1]
		var maxDice = 6
		console.log(msg.split(" "))
		if (!isNaN(numberToRoll) && msg.split(" ")[1] > 0) maxDice = numberToRoll
		var randomDice = Math.floor(maxDice*Math.random()) + 1
		chatClient.say(channel, randomDice)
	}
}