const { authProvider } = require("./authprovider.js")
const config = require("../config.json")

const ChatClient = require("@twurple/chat").ChatClient
const chatClient = new ChatClient({ authProvider, channels: config.twitch.channels })

exports.chatClient = chatClient