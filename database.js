const config = require("./config.json")
const emotes = config.twitch.emotes
//const { logger } = require("./logger.js")
const { setCooldown, getCooldown } = require("./helpers/cooldownhelper.js")
const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("database.db")

db.run("CREATE TABLE IF NOT EXISTS `channels` (`name` varchar(32) NOT NULL, `channel_id` integer NOT NULL, `online` integer NOT NULL)")
db.run("CREATE TABLE IF NOT EXISTS `emotes` (`user_id` integer NOT NULL,  `channel_id` integer NOT NULL, `emote` varchar(100) NOT NULL, `uses` integer NOT NULL, UNIQUE (`user_id`,`emote`,`channel_id`))")
db.run("CREATE TABLE IF NOT EXISTS `messages` (`user_id` integer NOT NULL, `channel_id` integer NOT NULL, `total` integer NOT NULL, UNIQUE (`user_id`,`channel_id`))")
db.run("CREATE TABLE IF NOT EXISTS `users` (`user_id` integer NOT NULL, `username` varchar(25) NOT NULL, `whitelisted` BOOLEAN NOT NULL DEFAULT 0, UNIQUE (`user_id`))")
db.run("CREATE TABLE IF NOT EXISTS `bans` (`user_id` integer NOT NULL, `channel_id` integer NOT NULL, `bans` integer NOT NULL DEFAULT 0, UNIQUE (`user_id`,`channel_id`))")


async function db_get(query, queryArray){
	return new Promise(function(resolve,reject){
		if (queryArray) {
			db.get(query, queryArray, function(err,rows){
				if(err){return reject(err)}
				resolve(rows)
			})
		}
		else {
			db.get(query, queryArray, function(err,rows){
				if(err){return reject(err)}
				resolve(rows)
			})
		}
	})
}

async function db_all(query, queryArray){
	return new Promise(function(resolve,reject){
		if (queryArray) {
			db.all(query, queryArray, function(err,rows){
				if(err){return reject(err)}
				resolve(rows)
			})
		}
		else {
			db.all(query, queryArray, function(err,rows){
				if(err){return reject(err)}
				resolve(rows)
			})
		}
	})
}

async function getTopTenEmotes(channel_id) {
	let data = await db_all("SELECT emote, SUM(uses) AS total FROM emotes WHERE channel_id = ? GROUP BY emote ORDER BY total DESC LIMIT 10", [channel_id])
	if (data) return data
	return null
}

async function removeMessagesFromUser(channel_id, user_id, numberOfMessagesToRemove) {
	db.run("UPDATE messages SET total = total - ? WHERE channel_id = ? AND user_id = ?", [numberOfMessagesToRemove, channel_id, user_id])
}

async function addMessagesToUser(channel_id, user_id, numberOfMessagesToAdd) {
	db.run("UPDATE messages SET total = total + ? WHERE channel_id = ? AND user_id = ?", [numberOfMessagesToAdd, channel_id, user_id])
}

async function addBansToUser(channel_id, user_id, numberOfBansToAdd) {
	db.run("INSERT INTO bans(user_id, channel_id, bans) VALUES(?, ?, ?) ON CONFLICT DO UPDATE SET bans = bans + ?", [user_id, channel_id, numberOfBansToAdd, numberOfBansToAdd])
}

async function getTopTenEmotesByUserID(channel_id, user_id) {
	let data = await db_all("SELECT emote, SUM(uses) AS total FROM emotes WHERE channel_id = ? AND user_id = ? GROUP BY emote ORDER BY total DESC LIMIT 10", [channel_id, user_id])
	if (data) return data
	return null
}

async function getChannels() {
	let data = await db.all("SELECT * FROM channels")
	console.log(data)
	if (data) return data
}

function addTwitchUserToDB(user_id, username) {
	db.run("INSERT INTO users(username, user_id) VALUES(?, ?) ON CONFLICT DO UPDATE SET username = ?", [username, user_id, username])
	return
}

async function addToDB(user_id, channel_id) {
	const cooldown = await getCooldown(user_id)
	if (cooldown) return
	db.run("INSERT INTO messages(total, channel_id, user_id) VALUES(1, ?, ?) ON CONFLICT DO UPDATE SET total = total + 1", [channel_id, user_id])
	setCooldown(user_id, true)
	return
}

async function addEmoteToDB(user_id, msg, twitchEmotes, channel_id) {
	const cooldown = await getCooldown(user_id)
	if (cooldown) return
	for (var i = 0; i < emotes.length; i++) {
		if (msg.indexOf(emotes[i]) > -1) {
			db.run("INSERT INTO emotes (user_id, emote, channel_id, uses) VALUES(?, ?, ?, 1) ON CONFLICT DO UPDATE SET uses = uses + 1", [user_id, emotes[i], channel_id])
		}
	}
	var usedEmotes = []
	for (var j = 0; j < twitchEmotes.length; j++) {
		if (usedEmotes.indexOf(twitchEmotes[j].name) < 0 && twitchEmotes[j].name != undefined) {
			db.run("INSERT INTO emotes (user_id, emote, channel_id, uses) VALUES(?, ?, ?, 1) ON CONFLICT DO UPDATE SET uses = uses + 1", [user_id, twitchEmotes[j].name, channel_id])
			usedEmotes.push(twitchEmotes[j].name)
		}
	}
}

async function getEmotes(user_id, channel_id, emote) {
	if (user_id) {
		let data = await db_get("SELECT * FROM emotes WHERE user_id = ? AND channel_id = ? AND emote = ?", [user_id, channel_id, emote])
		if (data) return data
		return null
	}
	let data = await db_get("SELECT SUM(uses) AS total, emote FROM emotes WHERE emote = ? AND channel_id = ?", [emote, channel_id])
	if (data) return data
	return null
}

async function getMessages(user_id, channel_id) {
	if (user_id) {
		let data = await db_get("SELECT * FROM messages WHERE user_id = ? AND channel_id = ?", [user_id, channel_id])
		let messages = data.total
		return messages
	}
	let data = await db_get("SELECT SUM(total) AS total FROM messages WHERE channel_id = ?", [channel_id])
	let messages = data.total
	return messages
}

async function getBans(user_id, channel_id) {
	let data = await db_get("SELECT bans FROM bans WHERE user_id = ? AND channel_id = ?", [user_id, channel_id])
	if (data) return data.bans
	else return 0
}

async function incrementBans(user_id, channel_id) {
	db.run("INSERT INTO bans(user_id, channel_id, bans) VALUES(?, ?, 1) ON CONFLICT DO UPDATE SET bans = bans + 1", [user_id, channel_id])
	return
}

async function getAllMessages() {
	let data = await db_get("SELECT SUM(total) AS total FROM messages")
	let messages = data.total
	return messages
}

async function getUserIdByUsername(username) {
	let data = await db_get("SELECT m.total, m.user_id, u.username FROM messages m INNER JOIN users u ON m.user_id = u.user_id WHERE u.username = ?", [username])
	if (data) return data.user_id
	else return null
}

async function changeTwitchStreamStatus(channel_id, onlineStatus) {
	if (onlineStatus) return db.run("UPDATE channels SET online = 1 WHERE channel_id = ?", [channel_id])
	db.run("UPDATE channels SET online = 0 WHERE channel_id = ?", [channel_id])
}

async function getTwitchStreamStatus(channel_id) {
	let data = await db_get("SELECT online FROM channels WHERE channel_id = ?", [channel_id])
	return data.online
}

async function addChannelToDB(channel) {
	db.run("INSERT OR IGNORE INTO INTO channels(name, channel_id, online) VALUES(?, ?, 0)", ["#" + channel.name, channel.id])
}

async function getUsernameById(user_id) {
	let data = await db_get("SELECT m.total, m.user_id, u.username FROM messages m INNER JOIN users u ON m.user_id = u.user_id WHERE m.user_id = ?", [user_id])
	if (data) return data.username
	else return null
}

async function whitelistUser(user_id) {
	db.run("UPDATE users SET whitelisted = 1 WHERE user_id = ?", [user_id])
}

async function unwhitelistUser(user_id) {
	db.run("UPDATE users SET whitelisted = 0 WHERE user_id = ?", [user_id])
}

async function getWhitelistStatus(user_id) {
	let data = await db_get("SELECT whitelisted FROM users WHERE user_id = ?", [user_id])
	if (data)	return data.whitelisted
	else return 0
}

module.exports.getUserIdByUsername = getUserIdByUsername
module.exports.addTwitchUserToDB = addTwitchUserToDB
module.exports.addToDB = addToDB
module.exports.addEmoteToDB = addEmoteToDB
module.exports.getEmotes = getEmotes
module.exports.getMessages = getMessages
module.exports.getAllMessages = getAllMessages
module.exports.changeTwitchStreamStatus = changeTwitchStreamStatus
module.exports.getTwitchStreamStatus = getTwitchStreamStatus
module.exports.addChannelToDB = addChannelToDB
module.exports.getUsernameById = getUsernameById
module.exports.whitelistUser = whitelistUser
module.exports.unwhitelistUser = unwhitelistUser
module.exports.getWhitelistStatus = getWhitelistStatus
module.exports.getTopTenEmotes = getTopTenEmotes
module.exports.getTopTenEmotesByUserID = getTopTenEmotesByUserID
module.exports.removeMessagesFromUser = removeMessagesFromUser
module.exports.addMessagesToUser = addMessagesToUser
module.exports.getBans = getBans
module.exports.incrementBans = incrementBans
module.exports.addBansToUser = addBansToUser
module.exports.getChannels = getChannels