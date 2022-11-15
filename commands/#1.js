module.exports = {
	name: "#1",
	aliases: [],
	description: "",
	canWhisper: true,
	requiredState: 7,
	isOsuCommand: true,
	isPublic: false,
	execute: async function(msg, context, data) {
		var numberOneScore = data.getNumber1Score()
		if (!numberOneScore) return "Not in a map or map is unranked/no local scores."
		return `#1 score: ${numberOneScore.name} (${numberOneScore.maxCombo}x/${data.getMaxCombo()}x, ${numberOneScore.h100}x100/${numberOneScore.h50}x50/${numberOneScore.h0}xmiss, ${numberOneScore.accuracy}%, +${numberOneScore.mods})`
	}
}