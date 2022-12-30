const { zeldaAuthProvider } = require("./authprovider.js")
var authProvider = zeldaAuthProvider
const ApiClient = require ("@twurple/api").ApiClient
const { EventSubWsListener } = require('@twurple/eventsub-ws')

const apiClient = new ApiClient({ authProvider })

exports.apiClient = apiClient

const { shigeAuthProvider } = require("./authprovider.js")
authProvider = shigeAuthProvider

const listener = new EventSubWsListener({ apiClient });
const shigeapiClient = new ApiClient({ shigeAuthProvider })

exports.shigeapiClient = shigeapiClient
exports.listener = listener