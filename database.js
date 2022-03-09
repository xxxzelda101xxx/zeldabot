const config = require("./config.json")
const emotes = config.twitch.emotes
const mysql = require("mysql")
const mysqlEnabled = config.mysql.enabled 
const { logger } = require("./logger.js")
const { apiClient } = require("./utils/apiclient")

if (mysqlEnabled) {
	var con = mysql.createPool({
        connectionLimit : 100,
		host: config.mysql.host,
		user: config.mysql.user,
		password: config.mysql.password,
		database: config.mysql.database
	})
}

module.exports.addTwitchUserToDB = addTwitchUserToDB

function addTwitchUserToDB(user_id, username) {
    sqlQuery(`INSERT INTO users_test SET username = ?, user_id = ? ON DUPLICATE KEY UPDATE username = ?`, [username, user_id, username])
}

module.exports.addToDB = addToDB

function addToDB(user_id, channel_id) {
    sqlQuery(`INSERT INTO messages_test SET total = 1, channel_id = ?, user_id = ? ON DUPLICATE KEY UPDATE total = total + 1`, [channel_id, user_id])
}

module.exports.addEmoteToDB = addEmoteToDB

function addEmoteToDB(user_id, msg, twitchEmotes, channel_id) {
    for (var i = 0; i < emotes.length; i++) {
        if (msg.indexOf(emotes[i]) > -1) {
            sqlQuery(`INSERT INTO emotes_test SET user_id = ?, emote = ?, channel_id = ?, uses = 1 ON DUPLICATE KEY UPDATE uses = uses + 1`, [user_id, emotes[i], channel_id])
        }
    }
    var usedEmotes = []
    for (var j = 0; j < twitchEmotes.length; j++) {
        if (usedEmotes.indexOf(twitchEmotes[j].name) < 0 && twitchEmotes[j].name != undefined) {
            sqlQuery(`INSERT INTO emotes_test SET user_id = ?, emote = ?, channel_id = ?, uses = 1 ON DUPLICATE KEY UPDATE uses = uses + 1`, [user_id, twitchEmotes[j].name, channel_id])
            usedEmotes.push(twitchEmotes[j].name)
        }
    }
}

module.exports.sqlQuery = sqlQuery

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

module.exports.getOfflineTime = getOfflineTime

async function getOfflineTime(user_id, channel_id) {
    if (user_id) {
        var offlineTime = await sqlQuery(`SELECT * FROM watchtime_test WHERE user_id = ? AND channel_id = ?`, [user_id, channel_id])
        offlineTime = secondsToDhms(offlineTime[0].offlinetime * 60)
        return offlineTime
    }
    else {
        var offlineTime = await sqlQuery(`SELECT SUM(offlinetime) AS offlinetime FROM watchtime_test WHERE channel_id = ?`, [channel_id])
        offlineTime = secondsToDhms(offlineTime[0].offlinetime * 60)
        return offlineTime
    }
}

module.exports.getWatchTime = getWatchTime

async function getWatchTime(user_id, channel_id) {
    if (user_id) {
        var watchtime = await sqlQuery(`SELECT * FROM watchtime_test WHERE user_id = ? AND channel_id = ?`, [user_id, channel_id])
        watchtime = secondsToDhms(watchtime[0].watchtime * 60)
        return watchtime
    }
    else {
        var watchtime = await sqlQuery(`SELECT SUM(offlinetime) AS offlinetime FROM watchtime_test WHERE channel_id = ?`, [channel_id])
        watchtime = secondsToDhms(watchtime[0].watchtime * 60)
        return watchtime
    }
}

module.exports.getEmotes = getEmotes

async function getEmotes(user_id, channel_id, emote) {
    if (user_id) {
        var emote = await sqlQuery(`SELECT * FROM emotes_test WHERE user_id = ? AND channel_id = ? AND emote = ?`, [user_id, channel_id, emote])
        return emote[0]
    }
    else {
        var emote = await sqlQuery(`SELECT SUM(uses) AS total, emote FROM emotes_test WHERE emote = ? AND channel_id = ?`, [emote, channel_id])
        return emote[0]
    }
}

module.exports.getMessages = getMessages

async function getMessages(user_id, channel_id) {
    if (user_id) {
        var messages = await sqlQuery(`SELECT * FROM messages_test WHERE user_id = ? AND channel_id = ?`, [user_id, channel_id])
        messages = messages[0].total
        return messages
    }
    else {
        var messages = await sqlQuery(`SELECT SUM(total) AS total FROM messages_test WHERE channel_id = ?`, [channel_id])
        messages = messages[0].total
        return messages
    }
}

module.exports.getUserIdByUsername = getUserIdByUsername

async function getUserIdByUsername(username) {
    var user = await sqlQuery(`SELECT m.total, m.user_id, u.username FROM messages_test m INNER JOIN users_test u ON m.user_id = u.user_id WHERE u.username = ?`, [username])
    if (user.length > 0) {
        return user[0].user_id
    }
    else {
        console.log("User doent't exist in the database.")
    }
}

module.exports.updateMaps = updateMaps


async function updateMaps(data) {
	await sqlQuery("INSERT IGNORE shige_maps SET artist = ?, title = ?, mapper = ?, beatmapset_id = ?, uploaded = 0", [data.getArtist(), data.getTitle(), data.getMapper(), data.beatmapset_id])
}

module.exports.addWatchTimeToUser = addWatchTimeToUser


async function addWatchTimeToUser(channel, username, channel_id) {
    var isStreamLive = await getTwitchStreamStatus(channel_id)
    var user = await apiClient.users.getUserByName(username)//.catch((e) => console.log(e))
	if (isStreamLive == 1) {
		await sqlQuery(`INSERT IGNORE users_test SET user_id = ?, username = ?`, [user.id, username])
        await sqlQuery(`UPDATE users_test SET username = ? WHERE user_id = ?`, [username, user.id])
		await sqlQuery(`INSERT INTO watchtime_test SET user_id = ?, channel_id = ?, watchtime = 1, offlinetime = 0 ON DUPLICATE KEY UPDATE watchtime = watchtime + 1`, [user.id, channel_id])
	}
	else {
		await sqlQuery(`INSERT IGNORE users_test SET user_id = ?, username = ?`, [user.id, username])
        await sqlQuery(`UPDATE users_test SET username = ? WHERE user_id = ?`, [username, user.id])
		await sqlQuery(`INSERT INTO watchtime_test SET user_id = ?, channel_id = ?, offlinetime = 1, watchtime = 0 ON DUPLICATE KEY UPDATE offlinetime = offlinetime + 1`, [user.id, channel_id])
	}
}

module.exports.changeTwitchStreamStatus = changeTwitchStreamStatus


async function changeTwitchStreamStatus(channel_id, onlineStatus) {
    if (onlineStatus) await sqlQuery(`UPDATE channels SET online = 1 WHERE channel_id = ?`, [channel_id])
    else await sqlQuery(`UPDATE channels SET online = 0 WHERE channel_id = ?`, [channel_id])
}

module.exports.getTwitchStreamStatus = getTwitchStreamStatus

async function getTwitchStreamStatus(channel_id) {
    var onlineStatus = await sqlQuery(`SELECT online FROM channels WHERE channel_id = ?`, [channel_id])
    return onlineStatus[0].online
}

module.exports.getUsernameById = getUsernameById

async function getUsernameById(user_id) {
    var results = sqlQuery(`SELECT m.total, m.user_id, u.username FROM messages_test m INNER JOIN users_test u ON m.user_id = u.user_id WHERE m.user_id = ?`, [user_id])
    if (results.length > 0) {
        return results[0].username
    }
    else {
        console.log("User doent't exist in the database.")
    }
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