const { zeldaAuthProvider } = require("./authprovider.js")
var authProvider = zeldaAuthProvider
const ApiClient = require ("@twurple/api").ApiClient

const apiClient = new ApiClient({ authProvider })

exports.apiClient = apiClient

const { shigeAuthProvider } = require("./authprovider.js")
authProvider = shigeAuthProvider

const shigeapiClient = new ApiClient({ authProvider })

exports.shigeapiClient = shigeapiClient