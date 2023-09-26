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

async function saveChannelToDB(name, channel_id, seventv_channel_id) {
	db.run("INSERT OR IGNORE INTO channels(name, channel_id, seventv_channel_id, online) VALUES(?, ?, ?, 0)", [name, channel_id, seventv_channel_id])
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

async function removeBansFromUser(channel_id, user_id, numberOfBansToRemove) {
	db.run("INSERT INTO bans(user_id, channel_id, bans) VALUES(?, ?, ?) ON CONFLICT DO UPDATE SET bans = bans - ?", [user_id, channel_id, numberOfBansToRemove, numberOfBansToRemove])
}

async function getTopTenEmotesByUserID(channel_id, user_id) {
	let data = await db_all("SELECT emote, SUM(uses) AS total FROM emotes WHERE channel_id = ? AND user_id = ? GROUP BY emote ORDER BY total DESC LIMIT 10", [channel_id, user_id])
	if (data) return data
	return null
}

async function getChannels() {
	let data = (await db_all("SELECT channel_id, seventv_channel_id FROM channels"))
	if (data) return data
}

function addTwitchUserToDB(user_id, username) {
	db.run("INSERT INTO users(username, user_id) VALUES(?, ?) ON CONFLICT DO UPDATE SET username = ?", [username, user_id, username])
	return
}

async function addSevenTVEmoteToDB(channel_id, emoteName, emoteID) {
	db.run("INSERT OR IGNORE INTO seventvemotes(channel_id, emote_name, emote_id) VALUES(?, ?, ?)", [channel_id, emoteName, emoteID])
	return
}

async function getSevenTVEmotesByChannelID(channel_id) {
	let data = (await db_all("SELECT emote_name FROM seventvemotes WHERE channel_id = ?", [channel_id])).map((row) => row.emote_name)
	return data
}

async function getChannelIDBySevenTVID(sevenTV_channel_id) {
	let data = await db_get("SELECT channel_id FROM channels WHERE seventv_channel_id = ?", [sevenTV_channel_id])
	return data.channel_id
}

async function addToDB(user_id, channel_id) {
	const cooldown = await getCooldown(user_id)
	if (cooldown) return
	db.run("INSERT INTO messages(total, channel_id, user_id) VALUES(1, ?, ?) ON CONFLICT DO UPDATE SET total = total + 1", [channel_id, user_id])
	setCooldown(user_id, true)
	return
}

async function addEmoteToDB(user_id, msg, twitchEmotes, channel_id) {
	var emotes = await getSevenTVEmotesByChannelID(channel_id)
	//const cooldown = await getCooldown(user_id)
	//if (cooldown) return
	for (var i = 0; i < emotes.length; i++) {
		var r = new RegExp("\\(", 'g')
		var r2 = new RegExp("\\)", 'g')
		var r3 = /^[a-zA-Z0-9]+$/
		var tempEmote = emotes[i].replace(r, "\\(").replace(r2, "\\)")
		var regex
		if (!emotes[i].match(r3)) {
			console.log(emotes[i])
			regex = new RegExp("\\b" + tempEmote, "g")
			console.log(regex)
		}
		else {
			console.log(emotes[i])
			regex = new RegExp(tempEmote, "g")
		}
		if (msg.match(regex)) {
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

async function getMessageRank(user_id, channel_id) {
	let data = await db_all("SELECT *, RANK() OVER ( ORDER BY total DESC ) AS rank FROM messages WHERE channel_id = ?", [channel_id])
	for (var i = 0; i < data.length; i++) {
		if (data[i].user_id == user_id) return data[i].rank
	}
}

async function getEmoteRank(emote, channel_id) {
	let data = await db_all("SELECT DISTINCT emote, SUM(uses) AS total, RANK() OVER ( ORDER BY sum(uses) DESC ) AS rank FROM emotes WHERE channel_id = ? GROUP BY emote ORDER BY total DESC", [channel_id])
	for (var i = 0; i < data.length; i++) {
		if (data[i].emote == emote) return data[i].rank
	}
}

async function getMessageLeaderboard(channel_id, page) {
	var limit = (page * 10)
	console.log(limit, limit + 10)
	let data = await db_all("SELECT u.username, m.user_id, m.total, RANK() OVER ( ORDER BY total DESC ) AS rank FROM messages m INNER JOIN users u ON m.user_id = u.user_id WHERE m.channel_id = ? LIMIT ?,?", [channel_id, limit, limit + 10])
	return data
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


 /**
 * Updates a given streamer's online status
 * @param {string} channel_id - The streamer to updates channel_id.
 * @param {boolean} onlineStatus - Whether or not the stream is online.
 */
async function changeTwitchStreamStatus(channel_id, onlineStatus) {
	if (onlineStatus) db.run("UPDATE channels SET online = 1 WHERE channel_id = ?", [channel_id])
	else db.run("UPDATE channels SET online = 0 WHERE channel_id = ?", [channel_id])
}

 /**
 * Get the stream status for a given channel_id.
 * @param {string} channel_id
 */
async function getTwitchStreamStatus(channel_id) {
	let data = await db_get("SELECT online FROM channels WHERE channel_id = ?", [channel_id])
	return data.online
}

async function addChannelToDB(channel) {
	db.run("INSERT OR IGNORE INTO channels(name, channel_id, online) VALUES(?, ?, 0)", ["#" + channel.name, channel.id])
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

const _getUserIdByUsername = getUserIdByUsername
export { _getUserIdByUsername as getUserIdByUsername }
const _addTwitchUserToDB = addTwitchUserToDB
export { _addTwitchUserToDB as addTwitchUserToDB }
const _addToDB = addToDB
export { _addToDB as addToDB }
const _addEmoteToDB = addEmoteToDB
export { _addEmoteToDB as addEmoteToDB }
const _getEmotes = getEmotes
export { _getEmotes as getEmotes }
const _getMessages = getMessages
export { _getMessages as getMessages }
const _getAllMessages = getAllMessages
export { _getAllMessages as getAllMessages }
const _changeTwitchStreamStatus = changeTwitchStreamStatus
export { _changeTwitchStreamStatus as changeTwitchStreamStatus }
const _getTwitchStreamStatus = getTwitchStreamStatus
export { _getTwitchStreamStatus as getTwitchStreamStatus }
const _addChannelToDB = addChannelToDB
export { _addChannelToDB as addChannelToDB }
const _getUsernameById = getUsernameById
export { _getUsernameById as getUsernameById }
const _whitelistUser = whitelistUser
export { _whitelistUser as whitelistUser }
const _unwhitelistUser = unwhitelistUser
export { _unwhitelistUser as unwhitelistUser }
const _getWhitelistStatus = getWhitelistStatus
export { _getWhitelistStatus as getWhitelistStatus }
const _getTopTenEmotes = getTopTenEmotes
export { _getTopTenEmotes as getTopTenEmotes }
const _getTopTenEmotesByUserID = getTopTenEmotesByUserID
export { _getTopTenEmotesByUserID as getTopTenEmotesByUserID }
const _removeMessagesFromUser = removeMessagesFromUser
export { _removeMessagesFromUser as removeMessagesFromUser }
const _addMessagesToUser = addMessagesToUser
export { _addMessagesToUser as addMessagesToUser }
const _getBans = getBans
export { _getBans as getBans }
const _incrementBans = incrementBans
export { _incrementBans as incrementBans }
const _addBansToUser = addBansToUser
export { _addBansToUser as addBansToUser }
const _removeBansFromUser = removeBansFromUser
export { _removeBansFromUser as removeBansFromUser }
const _getChannels = getChannels
export { _getChannels as getChannels }
const _addSevenTVEmoteToDB = addSevenTVEmoteToDB
export { _addSevenTVEmoteToDB as addSevenTVEmoteToDB }
const _getSevenTVEmotesByChannelID = getSevenTVEmotesByChannelID
export { _getSevenTVEmotesByChannelID as getSevenTVEmotesByChannelID }
const _getChannelIDBySevenTVID = getChannelIDBySevenTVID
export { _getChannelIDBySevenTVID as getChannelIDBySevenTVID }
const _getMessageRank = getMessageRank
export { _getMessageRank as getMessageRank }
const _getEmoteRank = getEmoteRank
export { _getEmoteRank as getEmoteRank }
const _getMessageLeaderboard = getMessageLeaderboard
export { _getMessageLeaderboard as getMessageLeaderboard }
const _saveChannelToDB = saveChannelToDB
export { _saveChannelToDB as saveChannelToDB }