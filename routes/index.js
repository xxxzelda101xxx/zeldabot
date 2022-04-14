const config = require("../config.json")
const channels = config.twitch.channels
const express = require("express")
const path = require("path")
const router = express()
const fs = require("fs")
const port = process.env.PORT || "8000"
const bodyParser = require("body-parser")
const { apiClient } = require("../utils/apiclient")
const { addChannelToDB, getMessages } = require("../database")
const { chatClient } = require("../utils/chatclient.js")
const { isStreamOnline } = require("../functions.js")
var totalMessagesThisSession = 0
router.use(express.urlencoded({ extended: true }))
router.use("/join_channel.js", express.static(path.join(__dirname, "js", "join_channels.js")))
router.use("/get_messages.js", express.static(path.join(__dirname, "js", "get_messages.js")))
router.use("/get_users.js", express.static(path.join(__dirname, "js", "get_users.js")))
router.use(bodyParser.urlencoded({extended:true}))
router.use(bodyParser.json())
router.set("views", path.join(__dirname, "views"))
router.set("view engine", "pug")

async function main() {
	router.get("/", function (req, res) {
		res.render("index", { title: "Express" })
	})

	router.get("/stats", function (req, res) {
		res.render("stats", { title: "Express" })
	})

	router.get("/get_channels", function (req, res) {
		res.status(200).send(channels)
	})
	
	router.get("/get_messages", async function (req, res) {
		var totalMessages = await getMessages(null, 37575275)
		res.status(200).send({ totalMessagesThisSession: totalMessagesThisSession, totalMessages: totalMessages })
	})
	
	router.get("/get_users", async function (req, res) {
		var viewers = await apiClient.unsupported.getChatters("shigetora")
		res.status(200).send({ total: viewers.allChatters.length})
	})
	
	router.post("/join_channel", async function (req, res) {
		if (req.body.channel.length > 25) {
			res.contentType("json")
			res.status(400).send({ error: "Username is too long" })
			return
		}
		var user = await apiClient.users.getUserByName(req.body.channel)
		if (user) {
			var channel = req.body.channel
			chatClient.join(channel)
			addChannelToDB(user)
			config.twitch.channels.push(channel)
			channels.push(channel)
			isStreamOnline(channel, false)
			fs.writeFileSync("config.json", JSON.stringify(config))
			chatClient.say(channel, "I have joined the channel!")
			res.status(200).send({ message: `Successfully joined #${channel}`})
		}
		else {
			res.status(404).send({ error: "User not found" })
		}
	})
	
	router.post("/ban_user", async function (req, res) {
		var user = await apiClient.users.getUserByName(req.body.channel)
		if (user) {
			var channel = req.body.channel
			var userToBan = req.body.user
			chatClient.ban(channel, userToBan)
			res.status(200).send({ message: `Successfully banned ${userToBan} from #${channel}`})
		}
		else {
			res.status(404).send({ error: "User not found" })
		}
	})
	
	router.listen(port, () => {
		console.log(`Listening to requests on http://localhost:${port}`)
	})
}

module.exports.startRouter = main

module.exports.incrementMessages = incrementMessages

function incrementMessages() {
	totalMessagesThisSession++
}