// Bootstrap loader for SCIP-Bot
// - Loads .env (optional)
// - Validates required environment variables
// - Runs deploy-commands and/or index based on argument

// Load dotenv if available
try {
	require('dotenv').config();
}
catch {
	// dotenv optional
}

const mode = process.argv[2];

function missingEnv(names) {
	return names.filter(n => !process.env[n]);
}

async function main() {
	// Determine required vars per mode
	const always = ['DISCORD_TOKEN'];
	const deployOnly = ['CLIENT_ID', 'GUILD_ID'];

	let required = [];
	if (mode === 'deploy') {
		required = [...always, ...deployOnly];
	}
	else if (mode === 'start') {
		required = [...always];
	}
	else {
		required = [...always, ...deployOnly];
	}

	const missing = missingEnv(required);
	if (missing.length) {
		console.error(`Missing required environment variables: ${missing.join(', ')}`);
		console.error('Copy .env.example to .env or set environment variables and try again.');
		process.exit(1);
	}

	// Run actions
	try {
		if (mode === 'deploy') {
			require('./deploy-commands.js');
			return;
		}

		if (mode === 'start') {
			require('./index.js');
			return;
		}

		// default: deploy then start
		require('./deploy-commands.js');
		// Then start the bot
		require('./index.js');
	}
	catch (err) {
		console.error('Bootstrap error:', err);
		process.exit(1);
	}
}

main();
