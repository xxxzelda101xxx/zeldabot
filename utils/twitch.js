import config from "../config.json" assert { type: "json" };
import fs from "fs"
import { ApiClient } from "@twurple/api"
import { EventSubWsListener } from '@twurple/eventsub-ws'
import { RefreshingAuthProvider } from "@twurple/auth"
import { ChatClient } from "@twurple/chat"
import tokenData from "../tokens.json" assert { type: "json" };
import shigeTokenData from "../shige_tokens.json" assert { type: "json" };
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken
const clientId = config.twitch.client_id
const clientSecret = config.twitch.client_secret

if (!useSeparateBroadcasterToken) {
	shigeTokenData = tokenData
}

const authProvider = new RefreshingAuthProvider({
    clientId,
    clientSecret,
    onRefresh: async (userId, newTokenData) => await fs.writeFileSync(`../tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
})
await authProvider.addUserForToken(tokenData, ['chat']);

const shigeAuthProvider = new RefreshingAuthProvider({
    clientId,
    clientSecret,
    onRefresh: async (userId, newTokenData) => await fs.writeFileSync(`../tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
})
await shigeAuthProvider.addUserForToken(shigeTokenData, ['chat']);
const apiClient = new ApiClient({ authProvider: authProvider })
const shigeapiClient = new ApiClient({ authProvider: shigeAuthProvider })
const listener = new EventSubWsListener({ apiClient: shigeapiClient })
const chatClient = new ChatClient({ authProvider, channels: config.twitch.channels, isAlwaysMod: true })

export { apiClient, shigeapiClient, chatClient, listener }