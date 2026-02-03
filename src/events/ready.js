const { Events } = require('discord.js');
const { sendLog } = require('../util/logger');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await sendLog({
			message: `Bot logged in and ready`,
			client,
			type: 'success',
			command: 'ready',
			data: { botTag: client.user.tag },
		});
	},
};