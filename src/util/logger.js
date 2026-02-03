/* eslint-disable no-inline-comments */
const { EmbedBuilder } = require('discord.js');

const LOGGING_CHANNEL_ID = '1468311182938210518';

/**
 * Sends a log message to both console and Discord
 * @param {Object} options - Configuration options
 * @param {string} options.message - Main log message
 * @param {Object} options.client - Discord client instance (required for Discord logging)
 * @param {string} [options.type='info'] - Log type: 'info', 'success', 'warning', 'error', 'debug'
 * @param {Object} [options.data={}] - Additional data to log
 * @param {string} [options.command] - Command name (if applicable)
 * @param {string} [options.user] - User tag or ID (if applicable)
 * @param {string} [options.guild] - Guild name (if applicable)
 */
async function sendLog(options) {
	const {
		message,
		client,
		type = 'info',
		data = {},
		command = null,
		user = null,
		guild = null,
	} = options;

	// Console logging
	const timestamp = new Date().toISOString();
	const logPrefix = `[${timestamp}] [${type.toUpperCase()}]`;
	console.log(logPrefix, message, data);

	// Discord logging (if client is provided)
	if (client) {
		try {
			const channel = await client.channels.fetch(LOGGING_CHANNEL_ID);
			if (!channel) {
				console.error('Logging channel not found.');
				return;
			}

			// Determine embed color based on log type
			const colorMap = {
				info: 0x3498db, // Blue
				success: 0x2ecc71, // Green
				warning: 0xf39c12, // Orange
				error: 0xe74c3c, // Red
				debug: 0x95a5a6, // Gray
			};

			const embed = new EmbedBuilder()
				.setColor(colorMap[type] || 0x3498db)
				.setTitle(`${type.toUpperCase()}: ${command || 'System'}`)
				.setDescription(message)
				.setTimestamp();

			// Add fields for additional context
			if (user) embed.addFields({ name: 'User', value: user, inline: true });
			if (guild) embed.addFields({ name: 'Guild', value: guild, inline: true });

			// Add data fields if present
			if (Object.keys(data).length > 0) {
				const dataString = Object.entries(data)
					.map(([key, value]) => `**${key}**: ${value}`)
					.join('\n');
				embed.addFields({ name: 'Details', value: dataString || 'N/A', inline: false });
			}

			await channel.send({ embeds: [embed] });
		}
		catch (error) {
			console.error('Failed to send log to Discord channel:', error?.message ?? error);
		}
	}
}

module.exports = { sendLog };
