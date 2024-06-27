import { authProvider } from "./authprovider.js"
import { getAllChannelNames } from "../database.js"
import config from "../config.json" assert { type: "json" }
var channels = await getAllChannelNames()
console.log(channels[0])

import { ChatClient } from "@twurple/chat"
export const chatClient = new ChatClient({ authProvider, channels: config.twitch.channels, isAlwaysMod: false })