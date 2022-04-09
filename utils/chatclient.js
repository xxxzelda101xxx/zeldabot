const { zeldaAuthProvider } = require("./authprovider.js")
const config = require("../config.json")
const authProvider = zeldaAuthProvider

const ChatClient = require("@twurple/chat").ChatClient
const chatClient = new ChatClient({ authProvider, channels: config.twitch.channels })

exports.chatClient = chatClient