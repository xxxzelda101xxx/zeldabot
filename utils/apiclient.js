const { zeldaAuthProvider, shigeAuthProvider, StaticAuthProvider } = require("./authprovider.js")
const ApiClient = require ("@twurple/api").ApiClient
const { EventSubWsListener } = require('@twurple/eventsub-ws')
const apiClient = new ApiClient({ authProvider: zeldaAuthProvider })
const shigeapiClient = new ApiClient({ authProvider: shigeAuthProvider })
const shigeEventSubClient = new ApiClient({ authProvider: StaticAuthProvider })
const listener = new EventSubWsListener({ shigeEventSubClient });
exports.apiClient = apiClient
exports.shigeapiClient = shigeapiClient
exports.listener = listener