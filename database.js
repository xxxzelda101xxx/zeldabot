const config = require("./config.json")
const emotes = config.twitch.emotes
const mysql = require("mysql2")
const mysqlEnabled = config.mysql.enabled 
const { logger } = require("./logger.js")
const { apiClient } = require("./utils/apiclient")
const { setCooldown, getCooldown } = require("./helpers/cooldownhelper.js")

if (mysqlEnabled) {
	var con = mysql.createPool({
		connectionLimit : 100,
		host: config.mysql.host,
		user: config.mysql.user,
		password: config.mysql.password,
		database: config.mysql.database
	})
}

function addTwitchUserToDB(user_id, username) {
	sqlQuery("INSERT INTO users_test SET username = ?, user_id = ? ON DUPLICATE KEY UPDATE username = ?", [username, user_id, username])
	return
}

async function addToDB(user_id, channel_id) {
	const cooldown = await getCooldown(user_id)
	if (cooldown) return
	sqlQuery("INSERT INTO messages_test SET total = 1, channel_id = ?, user_id = ? ON DUPLICATE KEY UPDATE total = total + 1", [channel_id, user_id])
	setCooldown(user_id, true)
	return
}

async function addEmoteToDB(user_id, msg, twitchEmotes, channel_id) {
	const cooldown = await getCooldown(user_id)
	if (cooldown) return
	for (var i = 0; i < emotes.length; i++) {
		if (msg.indexOf(emotes[i]) > -1) {
			sqlQuery("INSERT INTO emotes_test SET user_id = ?, emote = ?, channel_id = ?, uses = 1 ON DUPLICATE KEY UPDATE uses = uses + 1", [user_id, emotes[i], channel_id])
		}
	}
	var usedEmotes = []
	for (var j = 0; j < twitchEmotes.length; j++) {
		if (usedEmotes.indexOf(twitchEmotes[j].name) < 0 && twitchEmotes[j].name != undefined) {
			sqlQuery("INSERT INTO emotes_test SET user_id = ?, emote = ?, channel_id = ?, uses = 1 ON DUPLICATE KEY UPDATE uses = uses + 1", [user_id, twitchEmotes[j].name, channel_id])
			usedEmotes.push(twitchEmotes[j].name)
		}
	}
}

function sqlQuery(queryString, queryArray) {
	return new Promise(function(resolve, reject) {
		if (queryArray) {
			logger.debug(`Executing MySQL query: ${queryString} with array: ${queryArray}`)
			con.query(queryString, queryArray, function (error, results) {
				if (error) {
					logger.error(`MySQL ${error}`)
					reject(error)
				}
				else {
					resolve(results)
				}
			})
		}
		else {
			logger.debug(`Executing MySQL query: ${queryString}`)
			con.query(queryString, function (error, results) {
				if (error) {
					logger.error(`MySQL ${error}`)
					reject(error)
				}
				else {
					resolve(results)
				}
			})
		}
	})
}

async function getOfflineTime(user_id, channel_id) {
	let offlineTime
	if (user_id) {
		offlineTime = await sqlQuery("SELECT * FROM watchtime_test WHERE user_id = ? AND channel_id = ?", [user_id, channel_id])
		offlineTime = secondsToDhms(offlineTime[0].offlinetime * 60)
		return offlineTime
	}
	else {
		offlineTime = await sqlQuery("SELECT SUM(offlinetime) AS offlinetime FROM watchtime_test WHERE channel_id = ?", [channel_id])
		offlineTime = secondsToDhms(offlineTime[0].offlinetime * 60)
		return offlineTime
	}
}

async function getWatchTime(user_id, channel_id) {
	let watchtime
	if (user_id) {
		watchtime = await sqlQuery("SELECT * FROM watchtime_test WHERE user_id = ? AND channel_id = ?", [user_id, channel_id])
		watchtime = secondsToDhms(watchtime[0].watchtime * 60)
		return watchtime
	}
	else {
		watchtime = await sqlQuery("SELECT SUM(offlinetime) AS offlinetime FROM watchtime_test WHERE channel_id = ?", [channel_id])
		watchtime = secondsToDhms(watchtime[0].watchtime * 60)
		return watchtime
	}
}

async function getEmotes(user_id, channel_id, emote) {
	let emoteObject
	if (user_id) {
		emoteObject = await sqlQuery("SELECT * FROM emotes_test WHERE user_id = ? AND channel_id = ? AND emote = ?", [user_id, channel_id, emote])
		if (emoteObject.length == 1) return emoteObject[0]
		return null
	}
	emoteObject = await sqlQuery("SELECT SUM(uses) AS total, emote FROM emotes_test WHERE emote = ? AND channel_id = ?", [emote, channel_id])
	if (emoteObject.length == 1) return emoteObject[0]
	return null
}

async function getMessages(user_id, channel_id) {
	let messages
	if (user_id) {
		messages = await sqlQuery("SELECT * FROM messages_test WHERE user_id = ? AND channel_id = ?", [user_id, channel_id])
		messages = messages[0].total
		return messages
	}
	messages = await sqlQuery("SELECT SUM(total) AS total FROM messages_test WHERE channel_id = ?", [channel_id])
	messages = messages[0].total
	return messages
}

async function getUserIdByUsername(username) {
	var user = await sqlQuery("SELECT m.total, m.user_id, u.username FROM messages_test m INNER JOIN users_test u ON m.user_id = u.user_id WHERE u.username = ?", [username])
	if (user.length > 0) return user[0].user_id
	else return null
}


async function updateMaps(data) {
	await sqlQuery("INSERT IGNORE shige_maps SET artist = ?, title = ?, mapper = ?, beatmapset_id = ?, uploaded = 0, username = ?", [data.getArtist(), data.getTitle(), data.getMapper(), data.beatmapset_id, data.getCurrentPlayerName()])
}

async function addWatchTimeToUser(channel, username, channel_id) {
	var isStreamLive = await getTwitchStreamStatus(channel_id)
	var user = await apiClient.users.getUserByName(username)
	if (isStreamLive) {
		await sqlQuery("INSERT IGNORE users_test SET user_id = ?, username = ?", [user.id, username])
		await sqlQuery("UPDATE users_test SET username = ? WHERE user_id = ?", [username, user.id])
		await sqlQuery("INSERT INTO watchtime_test SET user_id = ?, channel_id = ?, watchtime = 1, offlinetime = 0 ON DUPLICATE KEY UPDATE watchtime = watchtime + 1", [user.id, channel_id])
		return
	}
	await sqlQuery("INSERT IGNORE users_test SET user_id = ?, username = ?", [user.id, username])
	await sqlQuery("UPDATE users_test SET username = ? WHERE user_id = ?", [username, user.id])
	await sqlQuery("INSERT INTO watchtime_test SET user_id = ?, channel_id = ?, offlinetime = 1, watchtime = 0 ON DUPLICATE KEY UPDATE offlinetime = offlinetime + 1", [user.id, channel_id])
}

async function changeTwitchStreamStatus(channel_id, onlineStatus) {
	if (onlineStatus) return await sqlQuery("UPDATE channels SET online = 1 WHERE channel_id = ?", [channel_id])
	await sqlQuery("UPDATE channels SET online = 0 WHERE channel_id = ?", [channel_id])
}

async function getTwitchStreamStatus(channel_id) {
	var onlineStatus = await sqlQuery("SELECT online FROM channels WHERE channel_id = ?", [channel_id])
	return onlineStatus[0].online
}

async function addChannelToDB(channel) {
	await sqlQuery("INSERT IGNORE INTO channels SET name = ?, channel_id = ?, online = 0", ["#" + channel.name, channel.id])
}

async function getUsernameById(user_id) {
	var results = sqlQuery("SELECT m.total, m.user_id, u.username FROM messages_test m INNER JOIN users_test u ON m.user_id = u.user_id WHERE m.user_id = ?", [user_id])
	if (results.length > 0) return results[0].username
	else return null
}

function secondsToDhms(seconds) {
	seconds = Number(seconds)
	var d = Math.floor(seconds / (3600*24))
	var h = Math.floor(seconds % (3600*24) / 3600)
	var m = Math.floor(seconds % 3600 / 60)

	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
	var hDisplay = h > 0 ? h + (h == 1 ? " hour and " : " hours and ") : ""
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes") : ""
	return (dDisplay + hDisplay + mDisplay)
}

module.exports.updateMaps = updateMaps
module.exports.getUserIdByUsername = getUserIdByUsername
module.exports.addTwitchUserToDB = addTwitchUserToDB
module.exports.addToDB = addToDB
module.exports.addEmoteToDB = addEmoteToDB
module.exports.sqlQuery = sqlQuery
module.exports.getOfflineTime = getOfflineTime
module.exports.getWatchTime = getWatchTime
module.exports.getEmotes = getEmotes
module.exports.getMessages = getMessages
module.exports.addWatchTimeToUser = addWatchTimeToUser
module.exports.changeTwitchStreamStatus = changeTwitchStreamStatus
module.exports.getTwitchStreamStatus = getTwitchStreamStatus
module.exports.addChannelToDB = addChannelToDB
module.exports.getUsernameById = getUsernameById