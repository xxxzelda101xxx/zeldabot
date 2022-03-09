const cooldowns = new Map()
const config = require("../config.json")
const cooldownTime = config.twitch.cooldown_time

function setCooldown(command) {
	cooldowns.set(command, Date.now() + cooldownTime)
	setTimeout(() => cooldowns.delete(command), cooldownTime)
    return
}

function getCooldown(command) {
    return cooldowns.get(command)
}

exports.setCooldown = setCooldown
exports.getCooldown = getCooldown