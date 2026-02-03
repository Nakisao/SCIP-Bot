const { SlashCommandBuilder } = require('discord.js');
const { sendLog } = require('../../util/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
		await sendLog({
			message: 'Server command executed',
			client: interaction.client,
			type: 'success',
			command: 'server',
			user: interaction.user.tag,
			guild: interaction.guild.name,
			data: { memberCount: interaction.guild.memberCount },
		});
	},
};