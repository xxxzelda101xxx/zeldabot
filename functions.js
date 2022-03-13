const { addWatchTimeToUser, changeTwitchStreamStatus } = require("./database.js")
const { GosuMemory } = require("./classes/gosumemory.js")
//const { logger } = require("./logger.js")
const { apiClient } = require("./utils/apiclient")
const request = require("request")
const options = {json: true}
const { exec } = require("child_process")
var ffi = require("ffi-napi")
const { chatClient } = require("./utils/chatclient.js")
var hasKagamiBeenBanned = false
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

function getOsuWindowTitle() {
	return new Promise(function(resolve){
		exec("tasklist /fi \"imagename eq osu!.exe\" /fo list /v", { windowsHide: true }, async function(err, stdout, stderr) {
			var data = stdout.split("\n")
			data = data[9].substring(14)
			resolve(data.trim())
		})
	})
}

exports.makeOsuActiveWindow = makeOsuActiveWindow

async function makeOsuActiveWindow() {
	var windowTitle = await getOsuWindowTitle()
	var winToSetOnTop = user32.FindWindowA(null, windowTitle)
	var foregroundHWnd = user32.GetForegroundWindow()
	var currentThreadId = kernel32.GetCurrentThreadId()
	var windowThreadProcessId = user32.GetWindowThreadProcessId(foregroundHWnd, null)
	user32.ShowWindow(winToSetOnTop, 9)
	user32.SetWindowPos(winToSetOnTop, -1, 0, 0, 0, 0, 3)
	user32.SetWindowPos(winToSetOnTop, -2, 0, 0, 0, 0, 3)
	user32.SetForegroundWindow(winToSetOnTop)
	user32.AttachThreadInput(windowThreadProcessId, currentThreadId, 0)
	user32.SetFocus(winToSetOnTop)
	user32.SetActiveWindow(winToSetOnTop)
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
			if (channel == "shigetora") {
				if (hasKagamiBeenBanned == false){
					hasKagamiBeenBanned = true
					chatClient.ban(channel, "Kagami_77", "shige started stream get banned lmao")
				}
			}
			channel_id = stream.userId
			changeTwitchStreamStatus(channel_id, true)
		}
		else {
			if (channel == "shigetora") {
				hasKagamiBeenBanned = false
			}
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