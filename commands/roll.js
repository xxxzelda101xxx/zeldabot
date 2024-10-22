export default {
	name: "roll",
	aliases: [],
	description: "Roll a dice.",
	canWhisper: true,
	isOsuCommand: false,
	isPublic: false,
	execute: async function(msg, context, args) {
		var numberToRoll = msg.split(" ").filter(item => item)
		numberToRoll = numberToRoll[1]
		var maxDice = 6
		if (!isNaN(numberToRoll) && numberToRoll > 0) maxDice = numberToRoll
		var randomDice = Math.floor(maxDice*Math.random()) + 1
		return `/me ${context.userInfo.userName} rolls ${randomDice.toString()}`
	}
}