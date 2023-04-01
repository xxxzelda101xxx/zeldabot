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
	onRefresh: async newTokenData => await fs.writeFileSync("../tokens.json", JSON.stringify(newTokenData, null, 4), "UTF-8")
},
tokenData
)

const shigeAuthProvider = new RefreshingAuthProvider({
	clientId,
	clientSecret,
	onRefresh: async newTokenData => await fs.writeFileSync("../shige_tokens.json", JSON.stringify(newTokenData, null, 4), "UTF-8")
},
shigeTokenData
)

exports.authProvider = authProvider
exports.shigeAuthProvider = shigeAuthProvider