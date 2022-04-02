const { zeldaAuthProvider } = require("./authprovider.js")
const authProvider = zeldaAuthProvider
const config = require("../config.json")

const ChatClient = require("@twurple/chat").ChatClient
chatClient = new ChatClient({ authProvider, channels: config.twitch.channels })

exports.chatClient = chatClient