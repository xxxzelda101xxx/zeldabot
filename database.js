import { logger } from "./logger.js"
import { setCooldown, getCooldown } from "./helpers/cooldownhelper.js"
import config from "./config.json" assert { type: "json" };
import mysql from 'mysql';
var connection = mysql.createConnection({
  host     : config.mysql.host,
  user     : config.mysql.username,
  password : config.mysql.password,
  database : config.mysql.database
});

connection.connect();

async function queryDatabase(query, queryArray){
	return new Promise(function(resolve,reject){
		if (queryArray) {
			connection.query({sql: query, values: queryArray }, function(err, results, fields){
				if(err){return reject(err)}
				resolve(results)
			})
		}
		else {
			connection.query(query, function(err, results, fields){
				if(err){return reject(err)}
				resolve(results)
			})
		}
	})
}

export async function saveChannelToDB(name, channel_id, seventv_channel_id) {
	queryDatabase("INSERT IGNORE INTO channels(name, channel_id, seventv_channel_id, online, muted) VALUES(?, ?, ?, 0, 1)", [name, channel_id, seventv_channel_id])
}

export async function unmuteBotInChannel(channel_id) {
	queryDatabase("UPDATE channels SET muted = 0 WHERE channel_id = ?", [channel_id])
}

export async function isBotMutedInChannel(channel) {
	var data = await queryDatabase("SELECT muted FROM channels WHERE name = ? LIMIT 1", [channel])
	if (data[0].muted == true) return true
	else return false
}

export async function saveAliasToDB(alias, command) {
	queryDatabase("INSERT INTO aliases(alias, command) VALUES(?, ?)", [alias, command])
}

export async function deleteAliasFromDB(alias) {
	queryDatabase("DELETE FROM aliases WHERE alias = ?", [alias])
}

export async function checkIfAliasExists(alias) {
	var data = await queryDatabase("SELECT alias FROM aliases WHERE alias = ? LIMIT 1", [alias])
	if (data.length == 1) return true
	else return false
}

export async function getTopTenEmotes(channel_id) {
	let data = await queryDatabase("SELECT emote, SUM(uses) AS total FROM emotes WHERE channel_id = ? GROUP BY emote ORDER BY total DESC LIMIT 10", [channel_id])
	if (data) return data
	return null
}

export async function removeMessagesFromUser(channel_id, user_id, numberOfMessagesToRemove) {
	queryDatabase("UPDATE messages SET total = total - ? WHERE channel_id = ? AND user_id = ?", [numberOfMessagesToRemove, channel_id, user_id])
}

export async function addMessagesToUser(channel_id, user_id, numberOfMessagesToAdd) {
	queryDatabase("UPDATE messages SET total = total + ? WHERE channel_id = ? AND user_id = ?", [numberOfMessagesToAdd, channel_id, user_id])
}

export async function addBansToUser(channel_id, user_id, numberOfBansToAdd) {
	queryDatabase("INSERT INTO bans(user_id, channel_id, bans) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE bans = bans + ?", [user_id, channel_id, numberOfBansToAdd, numberOfBansToAdd])
}

export async function removeBansFromUser(channel_id, user_id, numberOfBansToRemove) {
	queryDatabase("INSERT INTO bans(user_id, channel_id, bans) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE bans = bans - ?", [user_id, channel_id, numberOfBansToRemove, numberOfBansToRemove])
}

export async function getTopTenEmotesByUserID(channel_id, user_id) {
	let data = await queryDatabase("SELECT emote, SUM(uses) AS total FROM emotes WHERE channel_id = ? AND user_id = ? GROUP BY emote ORDER BY total DESC LIMIT 10", [channel_id, user_id])
	if (data) return data
	return null
} 

export async function getChannels() {
	let data = (await queryDatabase("SELECT channel_id, seventv_channel_id FROM channels"))
	if (data) return data
}

export async function getAllChannelNames() {
	let data = (await queryDatabase("SELECT name FROM channels"))
	data = JSON.parse(JSON.stringify(data))
	var listOfChannelNames = []
	for (var i = 0; i < data.length; i++) {
		listOfChannelNames.push(data[i].name)
	}
	if (data) return listOfChannelNames
}


export async function addTwitchUserToDB(user_id, username) {
	await queryDatabase("INSERT INTO users(username, user_id) VALUES(?, ?) ON DUPLICATE KEY UPDATE username = ?", [username, user_id, username])
	return
}

export async function addSevenTVEmoteToDB(channel_id, emoteName, emoteID) {
	queryDatabase("INSERT IGNORE INTO seventvemotes(channel_id, emote_name, emote_id) VALUES(?, ?, ?)", [channel_id, emoteName, emoteID])
	return
}

export async function getSevenTVEmotesByChannelID(channel_id) {
	let data = (await queryDatabase("SELECT emote_name FROM seventvemotes WHERE channel_id = ?", [channel_id])).map((row) => row.emote_name)
	return data
}

export async function getChannelIDBySevenTVID(sevenTV_channel_id) {
	let data = await queryDatabase("SELECT channel_id FROM channels WHERE seventv_channel_id = ? LIMIT 1", [sevenTV_channel_id])
	return data.channel_id
}

export async function addToDB(user_id, channel_id) {
	const cooldown = await getCooldown(user_id)
	if (cooldown) return
	queryDatabase("INSERT INTO messages(total, channel_id, user_id) VALUES(1, ?, ?) ON DUPLICATE KEY UPDATE total = total + 1", [channel_id, user_id])
	setCooldown(user_id, true)
	return
}

export async function addEmoteToDB(user_id, msg, twitchEmotes, channel_id) {
	var msgArray = msg.split(" ")
	var emotes = await getSevenTVEmotesByChannelID(channel_id)
	for (var i = 0; i < msgArray.length; i++) {
		if (emotes.indexOf(msgArray[i]) > -1) {
			queryDatabase("INSERT INTO emotes (user_id, emote, channel_id, uses) VALUES(?, ?, ?, 1) ON DUPLICATE KEY UPDATE uses = uses + 1", [user_id, emotes[emotes.indexOf(msgArray[i])], channel_id])
		}
	}
	var usedEmotes = []
	for (var j = 0; j < twitchEmotes.length; j++) {
		if (usedEmotes.indexOf(twitchEmotes[j].name) < 0 && twitchEmotes[j].name != undefined) {
			queryDatabase("INSERT INTO emotes (user_id, emote, channel_id, uses) VALUES(?, ?, ?, 1) ON DUPLICATE KEY UPDATE uses = uses + 1", [user_id, twitchEmotes[j].name, channel_id])
			usedEmotes.push(twitchEmotes[j].name)
		}
	}
}

export async function getEmotes(user_id, channel_id, emote) {
	if (user_id) {
		let data = await queryDatabase("SELECT * FROM emotes WHERE user_id = ? AND channel_id = ? AND emote = ? LIMIT 1", [user_id, channel_id, emote])
		if (data) return data[0]
		return null
	}
	let data = await queryDatabase("SELECT SUM(uses) AS total, emote FROM emotes WHERE emote = ? AND channel_id = ?", [emote, channel_id])
	if (data) return data[0]
	return null
}

export async function getMessages(user_id, channel_id) {
	if (user_id) {
		let data = await queryDatabase("SELECT * FROM messages WHERE user_id = ? AND channel_id = ? LIMIT 1", [user_id, channel_id])
		let messages = data[0].total
		return messages
	}
	let data = await queryDatabase("SELECT SUM(total) AS total FROM messages WHERE channel_id = ?", [channel_id])
	let messages = data[0].total
	return messages
}

export async function getMessageRank(user_id, channel_id) {
	let data = await queryDatabase("SELECT *, RANK() OVER ( ORDER BY total DESC ) AS `rank` FROM messages WHERE channel_id = ?", [channel_id])
	for (var i = 0; i < data.length; i++) {
		if (data[i].user_id == user_id) return data[i].rank
	}
}

export async function getEmoteRank(emote, channel_id) {
	let data = await queryDatabase("SELECT DISTINCT emote, SUM(uses) AS total, RANK() OVER ( ORDER BY sum(uses) DESC ) AS `rank` FROM emotes WHERE channel_id = ? GROUP BY emote ORDER BY total DESC", [channel_id])
	for (var i = 0; i < data.length; i++) {
		if (data[i].emote == emote) return data[i].rank
	}
}

export async function getMessageLeaderboard(channel_id, page) {
	var limit = (page * 10)
	let data = await queryDatabase("SELECT u.username, m.user_id, m.total, RANK() OVER ( ORDER BY total DESC ) AS `rank` FROM messages m INNER JOIN users u ON m.user_id = u.user_id WHERE m.channel_id = ? LIMIT ?,?", [channel_id, limit, limit + 10])
	return data
}

export async function getCommandFromAlias(alias) {
	let data = await queryDatabase("SELECT command FROM aliases WHERE alias = ? LIMIT 1", [alias])
	if (data.length > 0) return data[0].command
	else return null
}

export async function getBans(user_id, channel_id) {
	let data = await queryDatabase("SELECT bans FROM bans WHERE user_id = ? AND channel_id = ? LIMIT 1", [user_id, channel_id])
	if (data.length == 1) return data[0].bans
	else return 0
}

/**
 * Increments a user_id's for a given channel_id.
 */
export async function incrementBans(user_id, channel_id) {
	queryDatabase("INSERT INTO bans(user_id, channel_id, bans) VALUES(?, ?, 1) ON DUPLICATE KEY UPDATE bans = bans + 1", [user_id, channel_id])
	return
}

/**
 * Gets the total of all messages across all channels.
 */
export async function getAllMessages() {
	let data = await queryDatabase("SELECT SUM(total) AS total FROM messages")
	let messages = data[0].total
	return messages
}

export async function getUserIdByUsername(username) {
	let data = await queryDatabase("SELECT m.total, m.user_id, u.username FROM messages m INNER JOIN users u ON m.user_id = u.user_id WHERE u.username = ? LIMIT 1", [username])
	if (data) return data[0].user_id
	else return null
}

/**
 * Updates a given streamer's online status
 * @param {string} channel_id - The streamer to updates channel_id.
 * @param {boolean} onlineStatus - Whether or not the stream is online.
 */
export async function changeTwitchStreamStatus(channel_id, onlineStatus) {
	if (onlineStatus) queryDatabase("UPDATE channels SET online = 1 WHERE channel_id = ?", [channel_id])
	else queryDatabase("UPDATE channels SET online = 0 WHERE channel_id = ?", [channel_id])
}

/**
 * Get the stream status for a given channel_id.
 * @param {string} channel_id
 */
export async function getTwitchStreamStatus(channel_id) {
	let data = await queryDatabase("SELECT online FROM channels WHERE channel_id = ? LIMIT 1", [channel_id])
	return data[0].online
}

export async function addChannelToDB(channel) {
	queryDatabase("INSERT IGNORE INTO channels(name, channel_id, online) VALUES(?, ?, 0)", ["#" + channel.name, channel.id])
}

export async function getUsernameById(user_id) {
	let data = await queryDatabase("SELECT m.total, m.user_id, u.username FROM messages m INNER JOIN users u ON m.user_id = u.user_id WHERE m.user_id = ? LIMIT 1", [user_id])
	if (data) return data[0].username
	else return null
}

export async function whitelistUser(user_id) {
	queryDatabase("UPDATE users SET whitelisted = 1 WHERE user_id = ?", [user_id])
}

export async function unwhitelistUser(user_id) {
	queryDatabase("UPDATE users SET whitelisted = 0 WHERE user_id = ?", [user_id])
}

export async function getWhitelistStatus(user_id) {
	let data = await queryDatabase("SELECT whitelisted FROM users WHERE user_id = ? LIMIT 1", [user_id])
	if (data) return data[0].whitelisted
	else return 0
}