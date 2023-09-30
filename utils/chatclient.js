import { authProvider } from "./authprovider.js"
import config from "../config.json" assert { type: "json" }

import { ChatClient } from "@twurple/chat"
export const chatClient = new ChatClient({ authProvider, channels: config.twitch.channels, isAlwaysMod: true })