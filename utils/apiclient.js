const { zeldaAuthProvider } = require("./authprovider.js")
var authProvider = zeldaAuthProvider
const ApiClient = require ("@twurple/api").ApiClient
const { EventSubWsListener } = require('@twurple/eventsub-ws')

const apiClient = new ApiClient({ authProvider })

exports.apiClient = apiClient

const { shigeAuthProvider } = require("./authprovider.js")
authProvider = shigeAuthProvider

//const listener = new EventSubWsListener({ authProvider });
const shigeapiClient = new ApiClient({ authProvider })

exports.shigeapiClient = shigeapiClient
//exports.listener = listener