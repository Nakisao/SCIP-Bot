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
const token = process.env.DISCORD_TOKEN || process.env.TOKEN || config.token;
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');

function getCommandFiles(dirPath) {
	let files = [];
	const items = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const item of items) {
		const itemPath = path.join(dirPath, item.name);

		if (item.isDirectory()) {
			files = files.concat(getCommandFiles(itemPath));
		}
		else if (item.isFile() && item.name.endsWith('.js')) {
			files.push(itemPath);
		}
	}
	return files;
}

// Collect command files recursively
const commandFiles = getCommandFiles(commandsPath);

for (const filePath of commandFiles) {
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Guards
if (!token) {
	console.error('No Discord token found. Set DISCORD_TOKEN in the environment or add it to config.json (not recommended).');
	process.exit(1);
}

if (!clientId) {
	console.error('CLIENT_ID must be set in the environment or in config.json to deploy global commands.');
	process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} global application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} global application (/) commands.`);
		console.log('Note: Global commands may take up to an hour to propagate across Discord.');
	}
	catch (error) {
		console.error(error);
		process.exit(1);
	}
})();

console.log('deploy commands (global) loaded');
