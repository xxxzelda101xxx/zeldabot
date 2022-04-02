const cooldowns = new Map()
const config = require("../config.json")
const commandCooldownTime = config.twitch.command_cooldown_time
const messageCooldownTime = config.twitch.message_cooldown_time

function setCooldown(data, isMessage) {
    if (isMessage) {
        cooldowns.set(data, Date.now() + messageCooldownTime)
	    setTimeout(() => cooldowns.delete(data), messageCooldownTime)
    }
    else {
        cooldowns.set(data, Date.now() + commandCooldownTime)
	    setTimeout(() => cooldowns.delete(data), commandCooldownTime)
    }
    return
}

function getCooldown(data) {
    return cooldowns.get(data)
}

module.exports.setCooldown = setCooldown
module.exports.getCooldown = getCooldown