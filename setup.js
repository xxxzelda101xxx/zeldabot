(async () => {
    const readline = require('readline-sync');
    const axios = require('axios');
    const fs = require('fs');
    const chalk = require('chalk');
    var config = { twitch: {}, osu: {}, mysql: {} }
    var tokens = {}

    console.log('');
    console.log('-----------------------------------------------');
    console.log('                zeldabot setup                 ');
    console.log('-----------------------------------------------');
    console.log('');
    console.log(chalk.yellow('If you continue with a blank value, the default will be used.'));
    console.log("")

    while (true) {
        input = readline.question(`Twitch channel the bot will use. (${chalk.red("required")}): `);
        if (!input) {
            console.log("")
            console.log("You must provide a twitch channel.")
            console.log("")
        }
        else {
            config.twitch.channels = [input]
            break
        }
    }

    console.log("")
    console.log(`The next few ${chalk.red("required")} inputs need you to make a twitch developer application.`)
    console.log("")
    console.log("You can create one here: https://dev.twitch.tv/console/apps")
    console.log("")
    console.log("You may name it whatever you want, but make sure the \"Oaut Redirect URL\" is \"http://localhost\"")
    console.log("")

    while (true) {
        input = readline.question(`What is your Twitch Client ID (${chalk.red("required")}): `);
        if (!input) {
            console.log("")
            console.log("You must provide a Twitch Client ID")
            console.log("")
        }
        else {
            config.twitch.client_id = input
            break
        }
    }

    console.log("")

    while (true) {
        input = readline.question(`What is your Twitch Client Secret (${chalk.red("required")}): `);
        if (!input) {
            console.log("")
            console.log("You must provide a Twitch Client Secret")
            console.log("")
        }
        else {
            config.twitch.client_secret = input
            break
        }
    }

    console.log("")

    var url = `https://id.twitch.tv/oauth2/authorize?client_id=${config.twitch.client_id}&redirect_uri=http://localhost&response_type=code&scope=chat:read+chat:edit`

    console.log("Next, you will need to allow your new application to access twitch chat.")
    console.log("Click the following URL and authorize it.")
    console.log(url)
    console.log("After you click authorize, you will be redirected to localhost. Copy the new URL and paste it in the following question.")
    console.log("")

    while (true) {
        input = readline.question(`What is the the new URL (${chalk.red("required")}): `);
        if (!input) {
            console.log("")
            console.log("You must the new URL")
            console.log("")
        }
        else {
            var code = input.split("code=")[1].split("&scope")[0]
            var twitchData = await axios.post(`https://id.twitch.tv/oauth2/token`, { client_id: config.twitch.client_id, client_secret: config.twitch.client_secret, code: code, grant_type: "authorization_code", redirect_uri: "http://localhost"})
            tokens.accessToken = twitchData.data.access_token
            tokens.refreshToken = twitchData.data.refresh_token
            tokens.scope = twitchData.data.scope
            tokens.expiresIn = twitchData.data.expires_in
            tokens.obtainmentTimestamp = 0
            break
        }
    }

    try{
        fs.writeFileSync('./configtest.json', JSON.stringify(config, false, "\t"));
        console.log("Created config file.");
    }
    catch(e) {
        console.error(e);
        console.error(chalk.redBright("Failed to create config.json file."));
    }
    try {
        fs.writeFileSync('./tokenstest.json', JSON.stringify(tokens, false, "\t"));
        console.log("Created tokens file.");
    }
    catch(e) {
        console.error(e);
        console.error(chalk.redBright("Failed to create tokens.json file."));
    }
})();