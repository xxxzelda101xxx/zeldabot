import { authProvider } from "./authprovider.js"
import { getAllChannelNames } from "../database.js"
var channels = await getAllChannelNames()

import { ChatClient } from "@twurple/chat"
export const chatClient = new ChatClient({ authProvider, channels: channels, isAlwaysMod: false })