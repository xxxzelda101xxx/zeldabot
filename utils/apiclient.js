import { authProvider, shigeAuthProvider } from "./authprovider.js"
import { ApiClient } from "@twurple/api"
import { EventSubWsListener } from '@twurple/eventsub-ws'
export const apiClient = new ApiClient({ authProvider: authProvider })
export const shigeapiClient = new ApiClient({ authProvider: shigeAuthProvider })
export const listener = new EventSubWsListener({ apiClient: shigeapiClient })