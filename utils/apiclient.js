import { authProvider, shigeAuthProvider } from "./authprovider.js"
import { ApiClient } from "@twurple/api"
import { EventSubWsListener } from '@twurple/eventsub-ws'
const apiClient = new ApiClient({ authProvider: authProvider })
const shigeapiClient = new ApiClient({ authProvider: shigeAuthProvider })
const listener = new EventSubWsListener({ apiClient: shigeapiClient })
const _apiClient = apiClient
export { _apiClient as apiClient }
const _shigeapiClient = shigeapiClient
export { _shigeapiClient as shigeapiClient }
const _listener = listener
export { _listener as listener }