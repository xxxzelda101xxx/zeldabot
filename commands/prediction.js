const { shigeapiClient } = require("../utils/apiclient")

module.exports = {
    name: `prediction`,
    description: `Starts a new prediction`,
    canWhisper: false,
    modOnly: true, 
    execute: async function(channel, user, msg, context, chatClient, data) {
        if (!context.userInfo.isMod && !context.userInfo.isBroadcaster) return
        user = await shigeapiClient.users.getUserByName("shigetora")
        const predictionAction = msg.toLowerCase().split(" ")[1].toLowerCase()
        const predictionName = msg.toLowerCase().split(" ")[2]
        if (predictionAction == "start") {
            if (predictionName == "dice") {
                var createPrediction = await shigeapiClient.helix.predictions.createPrediction(user, {  autoLockAfter: 300, outcomes: ["even", "odd"], title: "Will dice be even or odd" });
                chatClient.say(channel, `Prediction started.`)
            }
        }
        else if (predictionAction == "delete" || predictionAction == "cancel") {
            var prediction = await shigeapiClient.helix.predictions.getPredictions(user)
            prediction = prediction.data[0]
            console.log(prediction.status)
            if (prediction.status.toLowerCase() == "active") {
                var cancelPrediction = await shigeapiClient.helix.predictions.cancelPrediction(user, prediction.id);
                chatClient.say(channel, `Prediction cancelled.`)
            }
        }
    }
}