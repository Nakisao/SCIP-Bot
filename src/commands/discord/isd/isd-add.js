// add something to an intelligence file
// requires:
// - case ID
// optionally required:
// - a file to be uploaded
// - a link to be added
// adds the file to the intelligence case in the database
// requires: be ISD or SC-4+
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('isd-add')
		.setDescription('Add information to an existing intelligence case.')
		.addStringOption(option =>
			option
				.setName('case_id')
				.setDescription('The case ID to add information to.')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				flags: MessageFlags.Ephemeral,
			});
		}
		// TODO: Implement case addition logic
		return interaction.reply({
			content: 'This command is not yet implemented.',
			flags: MessageFlags.Ephemeral,
		});
	},
};