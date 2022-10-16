const config = require("../config.json")
const { logger } = require("../logger.js")
const path = require("path")
var parser = require("osu-parser")
var fs = require("fs")
const axios = require("axios")
const baseUrl = "https://osu.ppy.sh/osu/"
const liveppCalcDLL = config.osu.PerformanceCalculator_Live
const reworkppCalcDLL = config.osu.PerformanceCalculator_Rework
const isRemote = config.osu.isRemote

var songsFolder
if (isRemote) {
	songsFolder = config.osu.osu_files_folder
}
else {
	songsFolder = config.osu.Songs_folder
}
const { exec } = require("child_process")
class GosuMemory {
	constructor(data) {
		this.menu = data.menu
		this.gameplay = data.gameplay
		this.resultsScreen = data.resultsScreen
		this.beatmap_id = data.menu.bm.id
		this.beatmapset_id = data.menu.bm.set
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
	getTitle() {
		return this.menu.bm.metadata.title
	}
	getDifficulty() {
		return this.menu.bm.metadata.difficulty
	}
	getMapper() {
		return this.menu.bm.metadata.mapper
	}
	async getPPCustom(accuracy, mods) {
		var osuFile = await this.getOsuFile()
		var beatmap = parser.parseContent(fs.readFileSync(osuFile))
		var totalObjects = beatmap["nbCircles"] + beatmap["nbSliders"] + beatmap["nbSpinners"]
		var numberOf100sNeeded = totalObjects - Math.floor(totalObjects * (accuracy / 100))
		var commandString
		var converted_mods = getMods(mods)
		if (!mods) commandString = `dotnet ${liveppCalcDLL} simulate osu "${osuFile}" -G ${numberOf100sNeeded} ${this.getModsForPPCalc()} --json`
		else commandString = `dotnet ${liveppCalcDLL} simulate osu "${osuFile}" -G ${numberOf100sNeeded} ${converted_mods} --json`
		var PP = await calculatePP(commandString)
		return [PP, numberOf100sNeeded]
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
		if (isRemote) {
			var fileExists = await osuFileExists(this.menu.bm.id.toString())
			if (!fileExists) {
				await downloadOsuFile(this.menu.bm.id.toString())
			}

			return path.join(songsFolder, this.menu.bm.id.toString() + ".osu")
		}
        
		else {
			return path.join(songsFolder, this.menu.bm.path.folder, this.menu.bm.path.file)
		}
	}
	getModsForPPCalc() {
		return getMods(this.menu.mods.num)
	}
	getMaxCombo() {
		return this.menu.bm.stats.maxCombo
	}
	getMods() {
		return this.menu.mods.str
	}
	async getCurrentPP() {
		var osuFile = await this.getOsuFile()
		var commandString = `dotnet ${liveppCalcDLL} simulate osu "${osuFile}" -G ${this.gameplay.hits["100"]} -M ${this.gameplay.hits["50"]} -X ${this.gameplay.hits["0"]} -c ${this.gameplay.combo.max} ${this.getModsForPPCalc()} --json`
		var currentPP = await calculatePP(commandString)
		return currentPP
	}
	async getPPIfFc() {
		var osuFile = await this.getOsuFile()
		var adjusted100sCount = this.gameplay.hits["100"] + this.gameplay.hits["0"]
		var commandString = `dotnet ${liveppCalcDLL} simulate osu "${osuFile}" -G ${adjusted100sCount} -M ${this.gameplay.hits["50"]} -X 0 -c ${this.getMaxCombo()} ${this.getModsForPPCalc()} --json`
		var currentPP = await calculatePP(commandString)
		return currentPP
	}
	async getSSPP() {
		var osuFile = await this.getOsuFile()
		var commandString = `dotnet ${liveppCalcDLL} simulate osu "${osuFile}" ${this.getModsForPPCalc()} --json`
		var currentPP = await calculatePP(commandString)
		return currentPP
	}
	async getReworkPP() {
		var osuFile = await this.getOsuFile()
		var commandString = `dotnet ${reworkppCalcDLL} simulate osu "${osuFile}" -G ${this.gameplay.hits["100"]} -M ${this.gameplay.hits["50"]} -X ${this.gameplay.hits["0"]} -c ${this.gameplay.combo.max} ${this.getModsForPPCalc()} --json`
		var currentPP = await calculatePP(commandString)
		return currentPP
	}
	getSR() {
		return this.menu.bm.stats.fullSR
	}
	async getNewSR() {
		var osuFile = await this.getOsuFile()
		var commandString = `dotnet ${liveppCalcDLL} simulate osu "${osuFile}" ${this.getModsForPPCalc()} --json`
		var newSR = await calculatePP(commandString, true)
		return newSR
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
		return millisToMinutesAndSeconds(this.menu.bm.time.full)
	}
	getUR() {
		return this.gameplay.hits.unstableRate.toFixed(2)
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
		var returnString = ""
		//var mods_string = mods.match(/.{1,2}/g)
		var mods_string = [...new Set(mods.match(/.{1,2}/g))];
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

async function calculatePP(calcString, isSr) {
	return new Promise(function(resolve, reject) {
		exec(calcString, { windowsHide: true }, async function(err, stdout) {
			try {
				var data = JSON.parse(stdout)
				if (isSr) {
					resolve(data["difficulty_attributes"]["star_rating"].toFixed(2))
				}
				else {
					resolve(data["performance_attributes"]["pp"].toFixed(2))
				}
			}
			catch (e) {
				console.log(e)
				if (err) {
					if (err.toString().indexOf("Beatmap can not be converted for the ruleset") > 0) {
						reject("Only osu!standard is supported.")
						return
					}
					else {
						logger.error(`Error calculating pp. Failing command: ${calcString}`)
					}
				}
				else {
					logger.error(`Error calculating pp. Failing command: ${calcString}`)
					reject("An error occured while processing the beatmap.")
				}
			}
		})
	})
}

async function osuFileExists(beatmap_id) {
	if (fs.existsSync(path.join(songsFolder, beatmap_id + ".osu"))) {
		return true
	} 
	else return false
}
async function downloadOsuFile(beatmap_id) {
	var data = await axios.get(`${baseUrl}${beatmap_id}`)
	const savePath = path.join(songsFolder, beatmap_id + ".osu")
	fs.writeFileSync(savePath, data.data, function () {})
}