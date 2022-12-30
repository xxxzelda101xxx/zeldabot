const { zeldaAuthProvider, shigeAuthProvider } = require("./authprovider.js")
const ApiClient = require ("@twurple/api").ApiClient
const { EventSubWsListener } = require('@twurple/eventsub-ws')
const apiClient = new ApiClient({ zeldaAuthProvider })
const shigeapiClient = new ApiClient({ shigeAuthProvider })

exports.apiClient = apiClient
exports.shigeapiClient = shigeapiClient
exports.listener = listener