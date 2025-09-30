const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a discord user by ID.'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};

console.log("ping.js loaded.");