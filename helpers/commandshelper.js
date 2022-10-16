const fs = require("fs")
var path = require("path")
console.log(path.join(__dirname, "..", "commands"))
const commandFiles = fs.readdirSync(path.join(__dirname, "..", "commands")).filter(file => file.endsWith(".js"))
var Commands = {}

for (var i = 0; i < commandFiles.length; i++) {
	const command = require(`../commands/${commandFiles[i]}`)
	Commands[`!${command.name}`] = command
	for (var j = 0; j < command.aliases.length; j++) {
		console.log(`!${command.aliases[j]}`)
		Commands[`!${command.aliases[j]}`] = command
	}
}

exports.Commands = Commands