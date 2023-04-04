const cooldowns = new Map()
import config from "../config.json" assert { type: "json" }
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

const _setCooldown = setCooldown
export { _setCooldown as setCooldown }
const _getCooldown = getCooldown
export { _getCooldown as getCooldown }