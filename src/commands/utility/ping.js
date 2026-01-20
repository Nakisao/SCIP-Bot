const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with the bot and API latency.'),
	async execute(interaction) {
		// 1. Reply to the interaction (without fetching/withResponse)
		await interaction.reply({ content: 'Pinging...' });

		// 2. Fetch the reply message after it has been sent
		const sent = await interaction.fetchReply();

		const latency = sent.createdTimestamp - interaction.createdTimestamp;
		let websocketLatency = interaction.client.ws.ping;
		if (websocketLatency === -1) {
			websocketLatency = 'websocket latency is somehow -1';
		}

		await interaction.editReply(`🏓 **Pong!**\n\n**Bot Latency:** \`${latency}ms\`\n**API Latency:** \`${websocketLatency}ms\``);
		console.log('Ping command executed by user: ', interaction.user.id, '\nBot Latency: ', latency, 'ms | API Latency: ', websocketLatency, 'ms');
	},
};

console.log('ping.js loaded.');