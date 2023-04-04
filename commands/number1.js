export default {
	name: "number1",
	aliases: ["#1"],
	description: "Returns the #1 score for the current map.",
	canWhisper: true,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data, args) {
		if (data.menu.state == 2 || data.menu.state == 7) {
			var numberOneScore = data.getNumber1Score()
			if (!numberOneScore) return "Not in a map or map is unranked/no local scores."
			return `#1 score: ${numberOneScore.name} (${numberOneScore.maxCombo}x/${data.getMaxCombo()}x, ${numberOneScore.h100}x100/${numberOneScore.h50}x50/${numberOneScore.h0}xmiss, ${numberOneScore.accuracy}%, +${numberOneScore.mods})`
		}
	}
}