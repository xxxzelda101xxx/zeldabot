import { writeFileSync } from "fs"
import config from "../config.json" with { type: "json" }
import { getChannels } from "../database.js"
import { RefreshingAuthProvider } from "@twurple/auth"
const clientId = config.twitch.client_id
const clientSecret = config.twitch.client_secret
import tokenData from "../tokens.json" with { type: "json" }
import shigeTokenData from "../shige_tokens.json" with { type: "json" }

export const authProvider = new RefreshingAuthProvider({
	clientId,
	clientSecret,
	onRefresh: async (userId, newTokenData) => await writeFileSync(`./tokens.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
})

export const shigeAuthProvider = new RefreshingAuthProvider({
	clientId,
	clientSecret,
	onRefresh: async (userId, newTokenData) => await writeFileSync(`./shige_tokens.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
})

await authProvider.addUserForToken(tokenData, ['chat']);
await shigeAuthProvider.addUserForToken(shigeTokenData);
shigeAuthProvider.addUser('70612673', shigeTokenData);
var channels = await getChannels()
for (var i = 0; i < channels.length; i++) {
	shigeAuthProvider.addUser(channels[i].channel_id, shigeTokenData);
}