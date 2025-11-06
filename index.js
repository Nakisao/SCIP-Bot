const fs = require('node:fs');
const path = require('node:path');
// Load .env into process.env (optional; requires dotenv in dependencies)
try {
	require('dotenv').config();
}
catch {
	// dotenv not installed; environment variables will be used instead
}
// eslint-disable-next-line no-unused-vars
const { Client, IntentsBitField, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const config = require('./config.json');
const token = process.env.DISCORD_TOKEN || process.env.TOKEN || config.token;

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

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

if (!token) {
	console.error('No Discord token found. Set DISCORD_TOKEN in the environment or add it to config.json (not recommended).');
	process.exit(1);
}

client.login(token);

// developer notes (no secrets here)
// perm integer 8
// payload 19957757
