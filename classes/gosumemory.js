const config = require("../config.json")
const { logger } = require("../logger.js")
const path = require("path")
var songsFolder = config.osu.Songs_folder

const { exec } = require("child_process")
class GosuMemory {
	constructor(data) {
		this.menu = data.menu
		this.gameplay = data.gameplay
		this.resultsScreen = data.resultsScreen
		this.beatmap_id = data.menu.bm.id
		this.beatmapset_id = data.menu.bm.set
		this.maxPP = data.maxPP
	}
  
	getGameMode() {
		return this.menu.gameMode
	}

	getMapData() {
		return this.menu.bm
	}
	getArtist() {
		return this.menu.bm.metadata.artist
	}
	getMaxCombo() {
		return this.menu.bm.stats.maxCombo
	}
	getTitle() {
		return this.menu.bm.metadata.title
	}
	getDifficulty() {
		return this.menu.bm.metadata.difficulty
	}
	getMapper() {
		return this.menu.bm.metadata.mapper
	}
	hasLeaderboard() {
		if (this.gameplay.leaderboard.slots != null) {
			if (this.gameplay.leaderboard.hasLeaderboard == true)return true
		}
		return false
	}
	getNumber1Score() {
		if (this.hasLeaderboard()) {
			this.gameplay.leaderboard.slots[0].accuracy = this.getNumber1Accuracy()
			return this.gameplay.leaderboard.slots[0]
		}
		return null
	}
	getNumber1Accuracy() {
		return (((this.gameplay.leaderboard.slots[0].h300 * 300) + (this.gameplay.leaderboard.slots[0].h100 * 100) + (this.gameplay.leaderboard.slots[0].h50 * 50) + (this.gameplay.leaderboard.slots[0].h0 * 0)) / ((this.gameplay.leaderboard.slots[0].h300 + this.gameplay.leaderboard.slots[0].h100 + this.gameplay.leaderboard.slots[0].h50 + this.gameplay.leaderboard.slots[0].h0) * 300) * 100).toFixed(2)
	}
	getAccuracy() {
		return (((this.resultsScreen["300"] * 300) + (this.resultsScreen["100"] * 100) + (this.resultsScreen["50"] * 50) + (this.resultsScreen["0"] * 0)) / ((this.resultsScreen["300"] + this.resultsScreen["100"] + this.resultsScreen["50"] + this.resultsScreen["0"]) * 300) * 100).toFixed(2)
	}
	getBackgroundLink() {
		return `https://assets.ppy.sh/beatmaps/${this.beatmapset_id}/covers/raw.jpg`
	}
	getCurrentStats() {
		return this.gameplay
	}
	getResultsScreen() {
		return this.resultsScreen
	}
	getCurrentPlayerName() {
		return this.gameplay.name
	}
	getResultsPlayerName() {
		return this.resultsScreen.name
	}
	async getOsuFile() {
		return path.join(songsFolder, this.menu.bm.path.folder, this.menu.bm.path.file)
	}
	getModsForPPCalc() {
		return getMods(this.menu.mods.num)
	}
	getMods() {
		return this.menu.mods.str
	}
	getSR() {
		return this.menu.bm.stats.fullSR
	}
	getBpm() {
		return this.menu.bm.stats["BPM"].max
	}
	getAR() {
		return this.menu.bm.stats["AR"]
	}
	getCS() {
		return this.menu.bm.stats["CS"]
	}
	getHP() {
		return this.menu.bm.stats["HP"]
	}
	getOD() {
		return this.menu.bm.stats["OD"]
	}
	getLength() {
		var mods = this.gameplay.leaderboard.ourplayer.mods != "" ? this.gameplay.leaderboard.ourplayer.mods : this.menu.mods.str
		if (mods.indexOf("DT") > -1 || mods.indexOf("NC") > -1) {
			return millisToMinutesAndSeconds(this.menu.bm.time.full / 1.5)
		}
		else if (mods.indexOf("HT")) {
			return millisToMinutesAndSeconds(this.menu.bm.time.full * 1.33)
		}
		else {
			return millisToMinutesAndSeconds(this.menu.bm.time.full)
		}
	}
	getUR() {
		return this.gameplay.hits.unstableRate.toFixed(2)
	}
	async estimate100s(accuracy, numObjects) {
		var numberOf100sNeeded
		for (var i = 0; i < numObjects; i++) {
			var num = i * (2/3) 
			if (((numObjects - num) / numObjects * 100) < accuracy) {
				numberOf100sNeeded = i - 1
				return numberOf100sNeeded
			}
		}
	}
}
  
module.exports.GosuMemory = GosuMemory

function millisToMinutesAndSeconds(millis) {
	var minutes = Math.floor(millis / 60000)
	var seconds = ((millis % 60000) / 1000).toFixed(0)
	return minutes + ":" + (seconds < 10 ? "0" : "") + seconds
}

function getMods(mods) {
	if (!isNaN(mods)) {
		mods = parseInt(mods, 10)
		var returnString = ""
		var ModsEnum = {
			None: 0,
			NoFail: 1,
			Easy: 2,
			TouchDevice: 4,
			Hidden: 8,
			HardRock: 16,
			DoubleTime: 64,
			HalfTime: 256,
			Nightcore: 512,
			Flashlight: 1024,
			SpunOut: 4096
		}
		if ((mods & ModsEnum.NoFail) == ModsEnum.NoFail) returnString += "-m NF "
		if ((mods & ModsEnum.Easy) == ModsEnum.Easy) returnString += "-m EZ "
		if ((mods & ModsEnum.TouchDevice) == ModsEnum.TouchDevice) returnString += "-m TD "
		if ((mods & ModsEnum.Hidden) == ModsEnum.Hidden) returnString += "-m HD "
		if ((mods & ModsEnum.HardRock) == ModsEnum.HardRock) returnString += "-m HR "
		if ((mods & ModsEnum.HalfTime) == ModsEnum.HalfTime) returnString += "-m HT "
		if ((mods & ModsEnum.DoubleTime) == ModsEnum.DoubleTime) {
			if ((mods & ModsEnum.Nightcore) == ModsEnum.Nightcore) returnString += "-m NC "
			else returnString += "-m DT "
		}
		if ((mods & ModsEnum.Flashlight) == ModsEnum.Flashlight) returnString += "-m FL "
		if ((mods & ModsEnum.SpunOut) == ModsEnum.SpunOut) returnString += "-m SO "
		if (returnString === "") {
			returnString = ""
		}
		return returnString
	}
	else {
		let returnString = ""
		//var mods_string = mods.match(/.{1,2}/g)
		var mods_string = [...new Set(mods.match(/.{1,2}/g))]
		for (var i = 0; i < mods_string.length; i++) {
			if (mods_string[i] == "nf") returnString += "-m NF "
			if (mods_string[i] == "ez") returnString += "-m EZ "
			if (mods_string[i] == "td") returnString += "-m TD "
			if (mods_string[i] == "hd") returnString += "-m HD "
			if (mods_string[i] == "hr") returnString += "-m HR "
			if (mods_string[i] == "ht") returnString += "-m HT "
			if (mods_string[i] == "dt") returnString += "-m DT "
			if (mods_string[i] == "nc") returnString += "-m NC "
			if (mods_string[i] == "fl") returnString += "-m FL "
			if (mods_string[i] == "so") returnString += "-m SO "
		}
		if (returnString === "") {
			returnString = ""
		}
		return returnString
	}
}