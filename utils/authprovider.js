const fs = require("fs")
const config = require("../config.json")
const RefreshingAuthProvider = require("@twurple/auth").RefreshingAuthProvider
const StaticAuthProvider = require("@twurple/auth").StaticAuthProvider
const clientId = config.twitch.client_id
const clientSecret = config.twitch.client_secret
const zeldaTokenData = require("../tokens.json")
const shigeTokenData = require("../shige_tokens.json")
const shigeStaticAuthProvider = new StaticAuthProvider(clientId, shigeTokenData.accessToken);

const zeldaAuthProvider = new RefreshingAuthProvider({
	clientId,
	clientSecret,
	onRefresh: async newTokenData => await fs.writeFileSync("../tokens.json", JSON.stringify(newTokenData, null, 4), "UTF-8")
},
zeldaTokenData
)

const shigeAuthProvider = new RefreshingAuthProvider({
	clientId,
	clientSecret,
	onRefresh: async newTokenData => await fs.writeFileSync("../shige_tokens.json", JSON.stringify(newTokenData, null, 4), "UTF-8")
},
shigeTokenData
)

exports.zeldaAuthProvider = zeldaAuthProvider
exports.shigeAuthProvider = shigeAuthProvider
exports.shigeStaticAuthProvider = shigeStaticAuthProvider