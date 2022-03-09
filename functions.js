const { updateMaps, addWatchTimeToUser, changeTwitchStreamStatus } = require("./database.js")
const { GosuMemory } = require("./classes/gosumemory.js")
const { logger } = require("./logger.js")
const { keyboard, Key } = require("@nut-tree/nut-js")
const { apiClient } = require("./utils/apiclient")
keyboard.config.autoDelayMs = 0
const request = require("request")
const options = {json: true}
const { exec } = require("child_process")
var lastGosuMemoryData
var ffi = require("ffi-napi")
var user32 = new ffi.Library("user32", {
	"GetTopWindow": ["long", ["long"]],
	"FindWindowA": ["long", ["string", "string"]],
	"SetActiveWindow": ["long", ["long"]],
	"SetForegroundWindow": ["bool", ["long"]],
	"BringWindowToTop": ["bool", ["long"]],
	"ShowWindow": ["bool", ["long", "int"]],
	"SwitchToThisWindow": ["void", ["long", "bool"]],
	"GetForegroundWindow": ["long", []],
	"AttachThreadInput": ["bool", ["int", "long", "bool"]],
	"GetWindowThreadProcessId": ["int", ["long", "int"]],
	"SetWindowPos": ["bool", ["long", "long", "int", "int", "int", "int", "uint"]],
	"SetFocus": ["long", ["long"]],
	"FindWindowW" : ["int32", [ "int32", "string" ]]
})
var kernel32 = new ffi.Library("Kernel32.dll", {
	"GetCurrentThreadId": ["int", []]
})

async function getOsuWindowTitle() {
	return new Promise(function(resolve, reject) {
		exec("tasklist /fi \"imagename eq osu!.exe\" /fo list /v", { windowsHide: true }, async function(err, stdout, stderr) {
			try {
				var data = stdout.split("\n")
				data = data[9].substring(14)
				resolve(data.trim())
			}
			catch (e) {
				logger.error(e)
				reject(e)
			}
		})
	})
}

module.exports.startReplaySaveLoop = startReplaySaveLoop

async function startReplaySaveLoop() {
	var data = await getGosumemoryData().catch(e => {return})
	if (data) {
		if (data.getResultsPlayerName() == "chocomint") {
			if (lastGosuMemoryData != data.resultsScreen.score) {
				lastGosuMemoryData = data.resultsScreen.score
				makeOsuActiveWindow()
				setTimeout(() => {
					keyboard.type(Key.F2)
				}, 1000)
			}
		}
	}
	setTimeout(() => {
		startReplaySaveLoop()
	}, 2000)
}

async function makeOsuActiveWindow() {
	var windowTitle = await getOsuWindowTitle()
	var winToSetOnTop = user32.FindWindowA(null, windowTitle)
	var foregroundHWnd = user32.GetForegroundWindow()
	var currentThreadId = kernel32.GetCurrentThreadId()
	var windowThreadProcessId = user32.GetWindowThreadProcessId(foregroundHWnd, null)
	var showWindow = user32.ShowWindow(winToSetOnTop, 9)
	var setWindowPos1 = user32.SetWindowPos(winToSetOnTop, -1, 0, 0, 0, 0, 3)
	var setWindowPos2 = user32.SetWindowPos(winToSetOnTop, -2, 0, 0, 0, 0, 3)
	var setForegroundWindow = user32.SetForegroundWindow(winToSetOnTop)
	var attachThreadInput = user32.AttachThreadInput(windowThreadProcessId, currentThreadId, 0)
	var setFocus = user32.SetFocus(winToSetOnTop)
	var setActiveWindow = user32.SetActiveWindow(winToSetOnTop)
}

module.exports.shigeMapTracking = shigeMapTracking

async function shigeMapTracking() {
	var data = await getGosumemoryData().catch(e => {return})
	if (data) {
		if (data.getCurrentPlayerName() == "chocomint") {
			await updateMaps(data)
		}
	}
	setTimeout(() => {
		shigeMapTracking()
	}, 100)
}

module.exports.isStreamOnline = isStreamOnline

async function isStreamOnline(channel, firstRun) {
	if (firstRun) {
		setTimeout(() => {
			isStreamOnline(channel, false)
		}, 60000)
	}
	else {
		var stream = await apiClient.streams.getStreamByUserName(channel)
		var channel_id
		if (stream != null) {
			channel_id = stream.userId
			changeTwitchStreamStatus(channel_id, true)
		}
		else {
			var user = await apiClient.users.getUserByName(channel)
			channel_id = user.id
			changeTwitchStreamStatus(user.id, false)
		}
		getCurrentViewers(channel, channel_id)
		setTimeout(() => {
			isStreamOnline(channel, false)
		}, 60000)
	}
}

async function getCurrentViewers(channel, channel_id) {
	var viewers = await apiClient.unsupported.getChatters(channel)
	for (var i = 0; i < viewers.allChatters.length; i++) {
		addWatchTimeToUser(channel, viewers.allChatters[i], channel_id)
	}
}

module.exports.getGosumemoryData = getGosumemoryData

async function getGosumemoryData() {
	return new Promise(function(resolve, reject) {
		try {
			request("http://0.0.0.0:24050/json", options, async function(error, res, body) {
				if(error) {
					return reject(error)
				}		

				if (!error && res.statusCode == 200) {
					if(body.error) {
						return reject(body.error)
					}
					var data = new GosuMemory(body)
					resolve (data)
				}
			})
		}
		catch(e) {
			reject(e)
		}
	})
}