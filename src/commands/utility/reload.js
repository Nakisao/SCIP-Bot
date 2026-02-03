const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLog } = require('../../../util/logger');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('[thisdoesntfuckingwork] Reloads a command.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload. Requires administrator.')
				.setAutocomplete(true)
				.setRequired(true)),
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`There is no command with name \`${commandName}\`!`);
		}

		delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

		try {
	        const newCommand = require(`../${command.category}/${command.data.name}.js`);
	        interaction.client.commands.set(newCommand.data.name, newCommand);
	        await sendLog({
	        	message: 'Command reloaded',
	        	client: interaction.client,
	        	type: 'success',
	        	command: 'reload',
	        	user: interaction.user.tag,
	        	guild: interaction.guild?.name,
	        	data: { reloadedCommand: newCommand.data.name },
	        });
	        await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
		}
		catch (error) {
	        await sendLog({
	        	message: 'Error reloading command',
	        	client: interaction.client,
	        	type: 'error',
	        	command: 'reload',
	        	user: interaction.user.tag,
	        	guild: interaction.guild?.name,
	        	data: { attemptedCommand: command.data.name, error: error.message },
	        });
	        await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
		}
	},
};