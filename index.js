const fs = require('node.fs');
const path = require('node.path');
const { Client, IntentsBitField, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
    intents: [
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildIntegrations,
        IntentsBitField.Flags.GuildWebhooks,
        IntentsBitField.Flags.GuildInvites,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessagePolls,
    ],
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// payload 19957757
// guild = server
client.on('clientReady', (c) => {
    console.log(`${c.user.tag} is online`);
});

client.login('MTQxNzU2NDg4OTc5MDI4Mzc3Ng.GByhKI.VMFsiYW44MGYf-aNfKGGdY1HouOtxzBXb5I-Bw');

//perm integer 8
//app id 1417564889790283776
//pub. key 5bd5579a97ffff274fe7a9bd17eb816eb420da08f195cd8596ad9aaa330b77bb
//client secret 03DhbyizADbekEdrMlnvVXjJOHeu1q6o
//client id 1417564889790283776
//bot token MTQxNzU2NDg4OTc5MDI4Mzc3Ng.GByhKI.VMFsiYW44MGYf-aNfKGGdY1HouOtxzBXb5I-Bw

//------------------------------------------------

//surely there's some way to have a custom file right?
