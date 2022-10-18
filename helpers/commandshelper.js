const fs = require("fs")
var path = require("path")
const commandFiles = fs.readdirSync(path.join(__dirname, "..", "commands")).filter(file => file.endsWith(".js"))
var Commands = {}

for (var i = 0; i < commandFiles.length; i++) {
	const command = require(`../commands/${commandFiles[i]}`)
	Commands[`!${command.name}`] = command
	for (var j = 0; j < command.aliases.length; j++) {
		Commands[`!${command.aliases[j]}`] = command
	}
}

exports.Commands = Commands