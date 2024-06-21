import { shigeapiClient } from "../utils/apiclient.js"
import config from '../config.json' assert { type: "json" }
const useSeparateBroadcasterToken = config.twitch.separateBroadcasterToken

export default {
	name: "prediction",
	aliases: ["gamba"],
	description: "Starts a new prediction",
	canWhisper: false,
	modOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
		console.log("a")		
		if (!useSeparateBroadcasterToken) return ""
		console.log("b")
		if (!context.userInfo.isMod && !context.userInfo.isBroadcaster && !config.twitch.admins[0] != "zelda101_") return
		console.log("c")
		let user = await shigeapiClient.users.getUserByName("shigetora")
		const predictionAction = msg.toLowerCase().split(" ")[1].toLowerCase()
		const predictionName = msg.toLowerCase().split(" ")[2]
		console.log(predictionAction)
		var prediction
		if (predictionAction == "start") {
			console.log(0)
			if (predictionName == "dice") {
				await shigeapiClient.helix.predictions.createPrediction(user, {  autoLockAfter: 300, outcomes: ["even", "odd"], title: "Will dice be even or odd" })
				return "Prediction started."
			}
		}
		else if (predictionAction == "delete" || predictionAction == "cancel") {
			console.log(1)
			prediction = await shigeapiClient.helix.predictions.getPredictions(user)
			prediction = prediction.data[0]
			if (prediction.status.toLowerCase() == "active") {
				shigeapiClient.helix.predictions.cancelPrediction(user, prediction.id)
				return "Prediction cancelled."
			}
		}
		else if (predictionAction == "lock") {
			console.log(2)
			prediction = await shigeapiClient.helix.predictions.getPredictions(user)
			prediction = prediction.data[0]
			if (prediction.status.toLowerCase() == "active") {
				shigeapiClient.helix.predictions.lockPrediction(user, prediction.id)
				return "Prediction locked."
			}
		}
		else if (predictionAction == "payout") {
			console.log(4)
			prediction = await shigeapiClient.helix.predictions.getPredictions(user)
			prediction = prediction.data[0]
			if (prediction.status.toLowerCase() == "locked") {
				if (prediction.title == "Will dice be even or odd") {
					const outcome =  msg.toLowerCase().split(" ")[2]
					if (outcome == "even") {
						for (var i = 0; i < prediction.outcomes.length; i++) {
							if (prediction.outcomes[i].title.toLowerCase() == "even") {
								await shigeapiClient.helix.predictions.resolvePrediction(user, prediction.id, prediction.outcomes[i].id)
								return "Channel points payed out to even."
							}
						} 
					}
					if (outcome == "odd") {
						for (let i = 0; i < prediction.outcomes.length; i++) {
							if (prediction.outcomes[i].title.toLowerCase() == "odd") {
								await shigeapiClient.helix.predictions.resolvePrediction(user, prediction.id, prediction.outcomes[i].id)
								return "Channel points payed out to odd."
							}
						} 
					}
				}
			}
		}
		console.log(4)
	}
}