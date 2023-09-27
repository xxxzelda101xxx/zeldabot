import { saveAliasToDB, deleteAliasFromDB, checkIfAliasExists } from "../database.js"

export default {
	name: "alias",
	aliases: [],
	description: "",
	canWhisper: false,
	adminOnly: true, 
	isPublic: false,
	isOsuCommand: false,
	execute: async function(msg, context, args) {
        if (msg.toLowerCase().split(" ").length < 3) return "Invalid Command Usage"
        var aliasToAddOrRemove = msg.toLowerCase().split(" ")[1]
        var alias = msg.toLowerCase().split(" ")[2]
        var command = msg.toLowerCase().split(" ")[3]
        var doesAliasExist = await checkIfAliasExists(alias)
        if (aliasToAddOrRemove == "add" && msg.toLowerCase().split(" ").length == 4) {
            if (doesAliasExist) return "That alias is already in use, please delete it first."
            await saveAliasToDB(alias, command)
            return `An alias for ${command} with the name ${alias} has been created.`
        }
        else if (aliasToAddOrRemove == "delete" || aliasToAddOrRemove == "remove" || aliasToAddOrRemove == "del") {
            if (!doesAliasExist) return "That alias doesn't exist in the first place!."
            deleteAliasFromDB(alias)
            return `The alias ${alias} has been deleted.`
        }
	}
}