const config = require("./config.json")
const channels = config.twitch.channels
const express = require("express")
const path = require("path")
const router = express()
const fs = require("fs")
var messages = 0
router.use(express.urlencoded({
	extended: true
}))
router.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist/"))
const port = process.env.PORT || "8000"
const bodyParser = require("body-parser")
router.use(bodyParser.urlencoded({extended:true}))
router.use(bodyParser.json())
router.set("views", path.join(__dirname, "views"))
router.set("view engine", "pug")
const { isStreamOnline } = require("./functions.js")
const { messageHandler } = require("./handlers/messagehandler.js")
const { subHandler } = require("./handlers/subhandler.js")
const { banHandler } = require("./handlers/banhandler.js")
const { logger } = require("./logger.js")
const { chatClient } = require("./utils/chatclient.js")
const { mapTrackingLoop } = require("./loops/maptrackingloop.js")
const { apiClient } = require("./utils/apiclient")
const { addChannelToDB } = require("./database")

async function main() {
	mapTrackingLoop()
	await chatClient.connect()
	chatClient.onRegister(() => {
		router.get("/", function (req, res) {
			res.render("index", { title: "Express" })
		})

		router.get("/channels", function (req, res) {
			res.status(200).send(channels)
		})

		router.get("/messages", function (req, res) {
			res.status(200).send({ total: messages})
		})

		router.get("/users", async function (req, res) {
			var viewers = await apiClient.unsupported.getChatters("shigetora")
			console.log(viewers.allChatters.length)
			res.status(200).send({ total: viewers.allChatters.length})
		})

		router.post("/join", async function (req, res) {
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
		
		router.post("/ban", async function (req, res) {
			if (req.body.channel.length > 25) {
				res.contentType("json")
				res.status(400).send({ error: "Username is too long" })
				return
			}
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
		logger.info("Connected to Twitch!")
		for (var i = 0; i < channels.length; i++) {
			isStreamOnline(channels[i], true)
		}
	})
	chatClient.onSubExtend(async function (channel, user, subInfo, context){
		subHandler(channel, user, subInfo, context)
	})
	chatClient.onSubGift(async function (channel, user, subInfo, context){
		subHandler(channel, user, subInfo, context)
	})
	chatClient.onResub(async function (channel, user, subInfo, context){
		subHandler(channel, user, subInfo, context)
	})
	chatClient.onBan(async function (channel, user) {
		banHandler(channel, user)
	})
	chatClient.onMessage(async function (channel, user, msg, context) {
		messages++
		messageHandler(channel, user, msg, context)
	})
	chatClient.onWhisper(async function (user, msg, context) {
		messageHandler(null, user, msg, context)
	})
}

main()

process
	.on("unhandledRejection", (reason, p) => {
		console.error(reason, "Unhandled Rejection at Promise", p)
	})
	.on("uncaughtException", err => {
		console.error(err, "Uncaught Exception thrown")
		process.exit(1)
	})