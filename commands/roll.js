module.exports = {
	name: "roll",
	description: "Roll a dice.",
	canWhisper: true,
	isOsuCommand: false,
	execute: async function(channel, user, msg, context, chatClient, data) {
		var randomDice = Math.floor(6*Math.random()) + 1
        chatClient.say(channel, randomDice)
	}
}