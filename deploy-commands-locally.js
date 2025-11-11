const { REST, Routes } = require('discord.js');
// Load .env into process.env (optional)
try {
	require('dotenv').config();
}
catch {
	// dotenv not installed; environment variables will be used instead
}
const config = require('./config.json');
const clientId = process.env.CLIENT_ID || config.clientId;
const guildId = process.env.GUILD_ID || config.guildId;
const token = process.env.DISCORD_TOKEN || process.env.TOKEN || config.token;
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');

/**
 * Recursively finds all command files in a given directory and its subdirectories.
 * @param {string} dirPath The path to start searching from.
 */
function getCommandFiles(dirPath) {
	let files = [];
	const items = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const item of items) {
		const itemPath = path.join(dirPath, item.name);

		if (item.isDirectory()) {
			// If it's a directory, recurse into it
			files = files.concat(getCommandFiles(itemPath));
		}
		else if (item.isFile() && item.name.endsWith('.js')) {
			// If it's a .js file, add its full path
			files.push(itemPath);
		}
	}
	return files;
}

// 1. Get all command files recursively
const commandFiles = getCommandFiles(commandsPath);

// 2. Process all found command files
for (const filePath of commandFiles) {
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Guard: ensure required env/config values are present before making API calls
// ... (Your original guards remain the same)
if (!token) {
	console.error('No Discord token found. Set DISCORD_TOKEN in the environment or add it to config.json (not recommended).');
	process.exit(1);
}

if (!clientId || !guildId) {
	console.error('CLIENT_ID and GUILD_ID must be set in the environment or in config.json.');
	process.exit(1);
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	// ... (Your original deployment logic remains the same)
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

console.log('deploy commands... loaded?');