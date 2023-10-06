const cooldowns = new Map()
import config from "../config.json" assert { type: "json" }
const commandCooldownTime = config.twitch.command_cooldown_time
const messageCooldownTime = config.twitch.message_cooldown_time

export function setCooldown(data, isMessage) {
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

export function getCooldown(data) {
    return cooldowns.get(data)
}