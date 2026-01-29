// create an intelligence file
// requires: user that will be associated w/ file (ID), reason created, security level (0 - 6, 0 lowest, 6 highest), name input
// requires: be SC-4+ or ISD
// SC4 > O5 > OoTA > TA
// ISD
// prints the case ID in the ISD server, with who created the file, who it's on, and why.
// utilizes MongoDB to store the intel
// Scans MongoDB for existing intel files on the user, and if one exists, it appends to it rather than creating a new one
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createOrAppendCase } = require('../../../util/isdCases');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('isd-create-case')
		.setDescription('Creates an intelligence case file.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The user to create the case file for.')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for creating the case file.')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('security_level')
				.setDescription('The security level of the case file (0-6).')
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(6))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
		// Ensure the command is not run in a DM.
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				flags: MessageFlags.Ephemeral,
			});
		}
		const targetUser = interaction.options.getUser('target', true);
		const reason = interaction.options.getString('reason', true);
		const securityLevel = interaction.options.getInteger('security_level', true);

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			// Create or append to the case in MongoDB
			const caseData = await createOrAppendCase({
				targetUserId: targetUser.id,
				creatorUserId: interaction.user.id,
				reason,
				securityLevel,
			});

			console.log('Case created/updated:', caseData.caseId, '\nfor user:', targetUser.id, '\nby user:', interaction.user.id, '\nreason:', reason, '\nsecurity level:', securityLevel);

			return interaction.editReply({
				content: `Intelligence case file ${caseData.caseId.substring(0, 8)}... created/updated for ${targetUser.tag} with security level ${securityLevel} for reason: ${reason}`,
				flags: MessageFlags.Ephemeral,
			});
		}
		catch (error) {
			console.error('Error creating/updating case:', error);
			if (interaction.deferred || interaction.replied) {
				return interaction.editReply({
					content: 'An error occurred while creating the case file.',
					flags: MessageFlags.Ephemeral,
				});
			}
			return interaction.reply({
				content: 'An error occurred while creating the case file.',
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};