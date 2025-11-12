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

/**
 * Recursively scans a directory for all JavaScript files.
 * @param {string} dir The directory path to start scanning from.
 * @returns {string[]} An array of absolute file paths for all found .js files.
 */
function getCommandFiles(dir) {
	let files = [];
	try {
		// Read the contents of the directory, returning fs.Dirent objects for type checking
		const items = fs.readdirSync(dir, { withFileTypes: true });

		for (const item of items) {
			const itemPath = path.join(dir, item.name);

			if (item.isDirectory()) {
				// If it's a directory, recursively call this function and merge results
				files = files.concat(getCommandFiles(itemPath));
			}
			else if (item.isFile() && item.name.endsWith('.js')) {
				// If it's a file ending in .js, add its path
				files.push(itemPath);
			}
		}
	}
	catch (error) {
		// Handle case where directory might not exist or access is denied
		console.error(`Error reading directory ${dir}:`, error.message);
	}
	return files;
}

const commandsPath = path.join(__dirname, 'src', 'commands');
// Use the new recursive function to load all commands regardless of nesting
const commandFiles = getCommandFiles(commandsPath);

for (const filePath of commandFiles) {
	// Only load files found by the recursive function
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		// Register canonical name
		client.commands.set(command.data.name, command);
		// If a DEV_SUFFIX is configured, also register an alias so '/name-dev' resolves
		// to the same handler in development environments.
		try {
			// Default dev suffix used by local deploy is '-dev' unless overridden.
			const devSuffix = process.env.DEV_SUFFIX ?? '-dev';
			if (devSuffix && typeof command.data.name === 'string') {
				const suffixed = `${command.data.name}${devSuffix}`;
				if (suffixed.length <= 32) {
					client.commands.set(suffixed, command);
				}
			}
		}
		catch {
			// ignore aliasing errors
		}
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
// Log how many commands were loaded for verification
console.log(`Successfully loaded ${client.commands.size} commands from nested folders.`);

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
