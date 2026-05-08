/**
 * Webhook Receiver for Roblox Game Logs
 * 
 * This module creates an HTTP server that receives JSON payloads from Roblox games
 * via the roproxy-lite proxy and forwards them to Discord as embeds.
 * 
 * Security: Validates PROXYKEY header to ensure requests come from authorized sources.
 */

const http = require('node:http');
const { EmbedBuilder } = require('discord.js');

class RobloxWebhookReceiver {
	constructor(client, options = {}) {
		this.client = client;
		this.port = options.port || 3000;
		this.proxyKey = options.proxyKey || process.env.PROXY_KEY || '';
		this.logChannelId = options.logChannelId || process.env.LOG_CHANNEL_ID;
		this.server = null;
	}

	/**
	 * Start the HTTP server to listen for webhook requests
	 */
	start() {
		this.server = http.createServer(async (req, res) => {
			// Only accept POST requests
			if (req.method !== 'POST') {
				res.writeHead(405, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: 'Method Not Allowed' }));
				return;
			}

			// Validate proxy key if configured
			const proxyKeyHeader = req.headers['proxykey'];
			if (this.proxyKey && proxyKeyHeader !== this.proxyKey) {
				res.writeHead(403, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: 'Unauthorized' }));
				return;
			}

			// Parse request body
			let body = '';
			req.on('data', chunk => {
				body += chunk.toString();
				// Prevent abuse: limit payload size to 1MB
				if (body.length > 1048576) {
					req.connection.destroy();
				}
			});

			req.on('end', async () => {
				try {
					const payload = JSON.parse(body);

					// Process the log and send to Discord
					await this.processLog(payload);

					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ success: true }));
				}
				catch (error) {
					console.error('[WebhookReceiver] Error processing payload:', error);
					res.writeHead(400, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ error: 'Invalid JSON' }));
				}
			});

			req.on('error', error => {
				console.error('[WebhookReceiver] Request error:', error);
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: 'Internal Server Error' }));
			});
		});

		this.server.listen(this.port, () => {
			console.log(`[WebhookReceiver] Listening for Roblox webhooks on port ${this.port}`);
		});

		this.server.on('error', error => {
			console.error('[WebhookReceiver] Server error:', error);
		});
	}

	/**
	 * Process a log payload and send it to Discord
	 * @param {Object} payload - The log payload from Roblox
	 */
	async processLog(payload) {
		if (!this.logChannelId) {
			console.warn('[WebhookReceiver] LOG_CHANNEL_ID not configured');
			return;
		}

		try {
			const channel = await this.client.channels.fetch(this.logChannelId);
			if (!channel || !channel.isTextBased()) {
				console.error('[WebhookReceiver] Invalid log channel');
				return;
			}

			// Create embed from payload
			const embed = this.createEmbed(payload);

			// Send to Discord
			await channel.send({ embeds: [embed] });
		}
		catch (error) {
			console.error('[WebhookReceiver] Failed to send log to Discord:', error);
		}
	}

	/**
	 * Create a Discord embed from the Roblox log payload
	 * Expected payload structure:
	 * {
	 *   "title": "Command Title",
	 *   "description": "What happened",
	 *   "username": "Roblox Username",
	 *   "userId": 123456789,
	 *   "placeId": 987654321,
	 *   "severity": "info|warning|error|success",
	 *   "timestamp": 1234567890,
	 *   "fields": [ { "name": "Field Name", "value": "Field Value", "inline": false } ]
	 * }
	 * @param {Object} payload - The log payload
	 * @returns {EmbedBuilder} Discord embed
	 */
	createEmbed(payload) {
		const {
			title = 'Roblox Log',
			description = 'No description provided',
			username = 'Unknown',
			userId = null,
			placeId = null,
			severity = 'info',
			timestamp = Date.now(),
			fields = [],
		} = payload;

		const severityColors = {
			info: 0x3498db,       // Blue
			warning: 0xf39c12,    // Orange
			error: 0xe74c3c,      // Red
			success: 0x2ecc71,    // Green
		};

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(severityColors[severity] || 0x95a5a6)
			.setTimestamp(new Date(timestamp))
			.setFooter({
				text: `Severity: ${severity.toUpperCase()}`,
				iconURL: this.client.user?.displayAvatarURL(),
			});

		// Add user information if available
		if (username) {
			embed.addFields({
				name: 'Player',
				value: userId ? `[${username}](https://www.roblox.com/users/${userId}/profile) (ID: ${userId})` : username,
				inline: true,
			});
		}

		// Add place information if available
		if (placeId) {
			embed.addFields({
				name: 'Place',
				value: `[View](https://www.roblox.com/games/${placeId}) (ID: ${placeId})`,
				inline: true,
			});
		}

		// Add custom fields
		if (fields && Array.isArray(fields)) {
			for (const field of fields) {
				if (field.name && field.value) {
					embed.addFields({
						name: field.name,
						value: String(field.value).substring(0, 1024), // Discord limit
						inline: field.inline !== false,
					});
				}
			}
		}

		return embed;
	}

	/**
	 * Stop the webhook receiver
	 */
	stop() {
		if (this.server) {
			this.server.close(() => {
				console.log('[WebhookReceiver] Server stopped');
			});
		}
	}
}

module.exports = RobloxWebhookReceiver;
