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

	// Mode-specific requirements:
	// - deploy:local -> needs CLIENT_ID + GUILD_ID
	// - deploy:global or deploy -> needs CLIENT_ID
	// - start -> needs only DISCORD_TOKEN
	let required = [];
	if (mode === 'deploy:local' || mode === 'deploy-local') {
		required = [...always, 'CLIENT_ID', 'GUILD_ID'];
	}
	else if (mode === 'deploy:global' || mode === 'deploy-global' || mode === 'deploy') {
		required = [...always, 'CLIENT_ID'];
	}
	else if (mode === 'start') {
		required = [...always];
	}
	else {
		// default: deploy globally then start -> need CLIENT_ID and DISCORD_TOKEN
		required = [...always, 'CLIENT_ID'];
	}

	const missing = missingEnv(required);
	if (missing.length) {
		console.error(`Missing required environment variables: ${missing.join(', ')}`);
		console.error('Copy .env.example to .env or set environment variables and try again.');
		process.exit(1);
	}

	// Run actions
	try {
		if (mode === 'deploy:local' || mode === 'deploy-local') {
			require('./deploy-commands-locally.js');
			return;
		}

		if (mode === 'deploy:global' || mode === 'deploy-global' || mode === 'deploy') {
			// default deploy action is global
			require('./deploy-commands-globally.js');
			return;
		}

		if (mode === 'start') {
			require('./index.js');
			return;
		}

		// default: deploy globally then start
		require('./deploy-commands-globally.js');
		// Then start the bot
		require('./index.js');
	}
	catch (err) {
		console.error('Bootstrap error:', err);
		process.exit(1);
	}
}

main();
