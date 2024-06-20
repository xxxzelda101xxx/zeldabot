import { logger } from "./logger.js"
import { setCooldown, getCooldown } from "./helpers/cooldownhelper.js"
import sqlite3 from "sqlite3"
const db = new sqlite3.Database("database.db")
db.run("CREATE TABLE IF NOT EXISTS `channels` (`name` varchar(32) NOT NULL, `channel_id` integer NOT NULL, `seventv_channel_id` varchar(24) DEFAULT NULL, `online` integer NOT NULL, UNIQUE (`channel_id`))")
db.run("CREATE TABLE IF NOT EXISTS `emotes` (`user_id` integer NOT NULL,  `channel_id` integer NOT NULL, `emote` varchar(100) NOT NULL, `uses` integer NOT NULL, UNIQUE (`user_id`,`emote`,`channel_id`))")
db.run("CREATE TABLE IF NOT EXISTS `seventvemotes` (`channel_id` integer NOT NULL, emote_name text NOT NULL, emote_id integer NOT NULL, UNIQUE (`channel_id`,`emote_id`))")
db.run("CREATE TABLE IF NOT EXISTS `messages` (`user_id` integer NOT NULL, `channel_id` integer NOT NULL, `total` integer NOT NULL, UNIQUE (`user_id`,`channel_id`))")
db.run("CREATE TABLE IF NOT EXISTS `users` (`user_id` integer NOT NULL, `username` varchar(25) NOT NULL, `whitelisted` BOOLEAN NOT NULL DEFAULT 0, UNIQUE (`user_id`))")
db.run("CREATE TABLE IF NOT EXISTS `bans` (`user_id` integer NOT NULL, `channel_id` integer NOT NULL, `bans` integer NOT NULL DEFAULT 0, UNIQUE (`user_id`,`channel_id`))")
db.run("CREATE TABLE IF NOT EXISTS `aliases` (`command` varchar(32) NOT NULL, `alias` varchar(32) NOT NULL, UNIQUE (`alias`))")


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

export async function saveChannelToDB(name, channel_id, seventv_channel_id) {
	db.run("INSERT OR IGNORE INTO channels(name, channel_id, seventv_channel_id, online) VALUES(?, ?, ?, 0)", [name, channel_id, seventv_channel_id])
}

export async function saveAliasToDB(alias, command) {
	db.run("INSERT INTO aliases(alias, command) VALUES(?, ?)", [alias, command])
}

export async function deleteAliasFromDB(alias) {
	db.run("DELETE FROM aliases WHERE alias = ?", [alias])
}

export async function checkIfAliasExists(alias) {
	var data = await db_get("SELECT alias FROM aliases WHERE alias = ?", [alias])
	if (data) return true
	else return false
}

export async function getTopTenEmotes(channel_id) {
	let data = await db_all("SELECT emote, SUM(uses) AS total FROM emotes WHERE channel_id = ? GROUP BY emote ORDER BY total DESC LIMIT 10", [channel_id])
	if (data) return data
	return null
}

export async function removeMessagesFromUser(channel_id, user_id, numberOfMessagesToRemove) {
	db.run("UPDATE messages SET total = total - ? WHERE channel_id = ? AND user_id = ?", [numberOfMessagesToRemove, channel_id, user_id])
}

export async function addMessagesToUser(channel_id, user_id, numberOfMessagesToAdd) {
	db.run("UPDATE messages SET total = total + ? WHERE channel_id = ? AND user_id = ?", [numberOfMessagesToAdd, channel_id, user_id])
}

export async function addBansToUser(channel_id, user_id, numberOfBansToAdd) {
	db.run("INSERT INTO bans(user_id, channel_id, bans) VALUES(?, ?, ?) ON CONFLICT DO UPDATE SET bans = bans + ?", [user_id, channel_id, numberOfBansToAdd, numberOfBansToAdd])
}

export async function removeBansFromUser(channel_id, user_id, numberOfBansToRemove) {
	db.run("INSERT INTO bans(user_id, channel_id, bans) VALUES(?, ?, ?) ON CONFLICT DO UPDATE SET bans = bans - ?", [user_id, channel_id, numberOfBansToRemove, numberOfBansToRemove])
}

export async function getTopTenEmotesByUserID(channel_id, user_id) {
	let data = await db_all("SELECT emote, SUM(uses) AS total FROM emotes WHERE channel_id = ? AND user_id = ? GROUP BY emote ORDER BY total DESC LIMIT 10", [channel_id, user_id])
	if (data) return data
	return null
}

export async function getChannels() {
	let data = (await db_all("SELECT channel_id, seventv_channel_id FROM channels"))
	if (data) return data
}

export async function addTwitchUserToDB(user_id, username) {
	db.run("INSERT INTO users(username, user_id) VALUES(?, ?) ON CONFLICT DO UPDATE SET username = ?", [username, user_id, username])
	return
}

export async function addSevenTVEmoteToDB(channel_id, emoteName, emoteID) {
	db.run("INSERT OR IGNORE INTO seventvemotes(channel_id, emote_name, emote_id) VALUES(?, ?, ?)", [channel_id, emoteName, emoteID])
	return
}

export async function getSevenTVEmotesByChannelID(channel_id) {
	let data = (await db_all("SELECT emote_name FROM seventvemotes WHERE channel_id = ?", [channel_id])).map((row) => row.emote_name)
	return data
}

export async function getChannelIDBySevenTVID(sevenTV_channel_id) {
	let data = await db_get("SELECT channel_id FROM channels WHERE seventv_channel_id = ?", [sevenTV_channel_id])
	return data.channel_id
}

export async function addToDB(user_id, channel_id) {
	const cooldown = await getCooldown(user_id)
	if (cooldown) return
	db.run("INSERT INTO messages(total, channel_id, user_id) VALUES(1, ?, ?) ON CONFLICT DO UPDATE SET total = total + 1", [channel_id, user_id])
	setCooldown(user_id, true)
	return
}

export async function addEmoteToDB(user_id, msg, twitchEmotes, channel_id) {
	var emotes = await getSevenTVEmotesByChannelID(channel_id)
	//const cooldown = await getCooldown(user_id)
	//if (cooldown) return
	for (var i = 0; i < emotes.length; i++) {
		var r = new RegExp("\\(", "g")
		var r2 = new RegExp("\\)", "g")
		var r3 = /^[a-zA-Z0-9]+$/
		var tempEmote = emotes[i].replace(r, "\\(").replace(r2, "\\)")
		var regex
		if (!emotes[i].match(r3)) {
			regex = new RegExp(tempEmote, "g")
		}
		else {
			regex = new RegExp("\\b" + tempEmote, "g")
		}
		if (msg.match(regex)) {
			console.log(regex)
			db.run("INSERT INTO emotes (user_id, emote, channel_id, uses) VALUES(?, ?, ?, 1) ON CONFLICT DO UPDATE SET uses = uses + 1", [user_id, emotes[i], channel_id])
			break;
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

export async function getEmotes(user_id, channel_id, emote) {
	if (user_id) {
		let data = await db_get("SELECT * FROM emotes WHERE user_id = ? AND channel_id = ? AND emote = ?", [user_id, channel_id, emote])
		if (data) return data
		return null
	}
	let data = await db_get("SELECT SUM(uses) AS total, emote FROM emotes WHERE emote = ? AND channel_id = ?", [emote, channel_id])
	if (data) return data
	return null
}

export async function getMessages(user_id, channel_id) {
	if (user_id) {
		let data = await db_get("SELECT * FROM messages WHERE user_id = ? AND channel_id = ?", [user_id, channel_id])
		let messages = data.total
		return messages
	}
	let data = await db_get("SELECT SUM(total) AS total FROM messages WHERE channel_id = ?", [channel_id])
	let messages = data.total
	return messages
}

export async function getMessageRank(user_id, channel_id) {
	let data = await db_all("SELECT *, RANK() OVER ( ORDER BY total DESC ) AS rank FROM messages WHERE channel_id = ?", [channel_id])
	for (var i = 0; i < data.length; i++) {
		if (data[i].user_id == user_id) return data[i].rank
	}
}

export async function getEmoteRank(emote, channel_id) {
	let data = await db_all("SELECT DISTINCT emote, SUM(uses) AS total, RANK() OVER ( ORDER BY sum(uses) DESC ) AS rank FROM emotes WHERE channel_id = ? GROUP BY emote ORDER BY total DESC", [channel_id])
	for (var i = 0; i < data.length; i++) {
		if (data[i].emote == emote) return data[i].rank
	}
}

export async function getMessageLeaderboard(channel_id, page) {
	var limit = (page * 10)
	console.log(limit, limit + 10)
	let data = await db_all("SELECT u.username, m.user_id, m.total, RANK() OVER ( ORDER BY total DESC ) AS rank FROM messages m INNER JOIN users u ON m.user_id = u.user_id WHERE m.channel_id = ? LIMIT ?,?", [channel_id, limit, limit + 10])
	return data
}

export async function getCommandFromAlias(alias) {
	let data = await db_get("SELECT command FROM aliases WHERE alias = ?", [alias])
	if (data) return data.command
	else return null
}

export async function getBans(user_id, channel_id) {
	let data = await db_get("SELECT bans FROM bans WHERE user_id = ? AND channel_id = ?", [user_id, channel_id])
	if (data) return data.bans
	else return 0
}

/**
 * Increments a user_id's for a given channel_id.
 */
export async function incrementBans(user_id, channel_id) {
	db.run("INSERT INTO bans(user_id, channel_id, bans) VALUES(?, ?, 1) ON CONFLICT DO UPDATE SET bans = bans + 1", [user_id, channel_id])
	return
}

/**
 * Gets the total of all messages across all channels.
 */
export async function getAllMessages() {
	let data = await db_get("SELECT SUM(total) AS total FROM messages")
	let messages = data.total
	return messages
}

export async function getUserIdByUsername(username) {
	let data = await db_get("SELECT m.total, m.user_id, u.username FROM messages m INNER JOIN users u ON m.user_id = u.user_id WHERE u.username = ?", [username])
	if (data) return data.user_id
	else return null
}

/**
 * Updates a given streamer's online status
 * @param {string} channel_id - The streamer to updates channel_id.
 * @param {boolean} onlineStatus - Whether or not the stream is online.
 */
export async function changeTwitchStreamStatus(channel_id, onlineStatus) {
	if (onlineStatus) db.run("UPDATE channels SET online = 1 WHERE channel_id = ?", [channel_id])
	else db.run("UPDATE channels SET online = 0 WHERE channel_id = ?", [channel_id])
}

/**
 * Get the stream status for a given channel_id.
 * @param {string} channel_id
 */
export async function getTwitchStreamStatus(channel_id) {
	let data = await db_get("SELECT online FROM channels WHERE channel_id = ?", [channel_id])
	return data.online
}

export async function addChannelToDB(channel) {
	db.run("INSERT OR IGNORE INTO channels(name, channel_id, online) VALUES(?, ?, 0)", ["#" + channel.name, channel.id])
}

export async function getUsernameById(user_id) {
	let data = await db_get("SELECT m.total, m.user_id, u.username FROM messages m INNER JOIN users u ON m.user_id = u.user_id WHERE m.user_id = ?", [user_id])
	if (data) return data.username
	else return null
}

export async function whitelistUser(user_id) {
	db.run("UPDATE users SET whitelisted = 1 WHERE user_id = ?", [user_id])
}

export async function unwhitelistUser(user_id) {
	db.run("UPDATE users SET whitelisted = 0 WHERE user_id = ?", [user_id])
}

export async function getWhitelistStatus(user_id) {
	let data = await db_get("SELECT whitelisted FROM users WHERE user_id = ?", [user_id])
	if (data)	return data.whitelisted
	else return 0
}