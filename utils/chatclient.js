import { authProvider } from "./authprovider.js"
import config from "../config.json" assert { type: "json" }

import { ChatClient } from "@twurple/chat"
const chatClient = new ChatClient({ authProvider, channels: config.twitch.channels, isAlwaysMod: true })

const _chatClient = chatClient
export { _chatClient as chatClient }