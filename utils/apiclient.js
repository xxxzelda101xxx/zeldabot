const { zeldaAuthProvider } = require("./authprovider.js")
var authProvider = zeldaAuthProvider
const ApiClient = require ("@twurple/api").ApiClient

apiClient = new ApiClient({ authProvider })

exports.apiClient = apiClient

const { shigeAuthProvider } = require("./authprovider.js")
authProvider = shigeAuthProvider

shigeapiClient = new ApiClient({ authProvider })

exports.shigeapiClient = shigeapiClient