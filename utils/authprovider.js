const fs = require("fs")
const config = require("../config.json")
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken
const RefreshingAuthProvider = require("@twurple/auth").RefreshingAuthProvider
const clientId = config.twitch.client_id
const clientSecret = config.twitch.client_secret
const tokenData = require("../tokens.json")
var shigeTokenData
if (!useSeparateBroadcasterToken) {
	shigeTokenData = require("../tokens.json")
}
else {
	shigeTokenData = require("../shige_tokens.json")
}

const authProvider = new RefreshingAuthProvider({
	clientId,
	clientSecret,
	onRefresh: async (userId, newTokenData) => await fs.writeFileSync(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
},
)
authProvider.addUserForToken(tokenData);

const shigeAuthProvider = new RefreshingAuthProvider({
	clientId,
	clientSecret,
	onRefresh: async (userId, newTokenData) => await fs.writeFileSync(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'UTF-8')
},
)
shigeAuthProvider.addUserForToken(tokenData);


exports.authProvider = authProvider
exports.shigeAuthProvider = shigeAuthProvider