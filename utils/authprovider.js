const fs = require("fs")
const config = require("../config.json")
const RefreshingAuthProvider = require("@twurple/auth").RefreshingAuthProvider
const clientId = config.twitch.client_id
const clientSecret = config.twitch.client_secret
const tokenData = require("../tokens.json")

const authProvider = new RefreshingAuthProvider({
		clientId,
		clientSecret,
		onRefresh: async newTokenData => await fs.writeFileSync("../tokens.json", JSON.stringify(newTokenData, null, 4), "UTF-8")
	},
	tokenData
)

exports.authProvider = authProvider