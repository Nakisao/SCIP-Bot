const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
		console.log('Server command executed by user: ', interaction.user.id, '\n | Server: ', interaction.guild.name, '\n | Members: ', interaction.guild.memberCount);
	},
};

console.log('server.js loaded.');