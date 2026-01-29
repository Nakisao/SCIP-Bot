// delete an intelligence file and stores it somewhere else
// requires: user that the file is associated with (ID)
// requires: be SC-4+ or ISD
// delete from MongoDB ISD and move it to RAISA Archives

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('isd-archive-case')
		.setDescription('Archive an intelligence case file.')
		.addStringOption(option =>
			option
				.setName('case_id')
				.setDescription('The case ID to archive.')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				flags: MessageFlags.Ephemeral,
			});
		}
		// TODO: Implement case archival logic
		return interaction.reply({
			content: 'This command is not yet implemented.',
			flags: MessageFlags.Ephemeral,
		});
	},
};