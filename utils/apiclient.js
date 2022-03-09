const { authProvider } = require("./authprovider.js")

const ApiClient = require ("@twurple/api").ApiClient
apiClient = new ApiClient({ authProvider })

exports.apiClient = apiClient