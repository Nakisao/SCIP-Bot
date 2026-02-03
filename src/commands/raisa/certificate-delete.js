// deletes a RAISA certificate by its ID.
// requires administrator
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { deleteCertificateById } = require('../../../raisa/certificates');
const { sendLog } = require('../../util/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('certificate-delete')
		.setDescription('Deletes a RAISA certificate by its ID.')
		.addStringOption(option =>
			option
				.setName('certificate_id')
				.setDescription('The ID of the certificate to delete')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		// Ensure the command is not run in a DM.
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				flags: MessageFlags.Ephemeral,
			});
		}
		const certificateId = interaction.options.getString('certificate_id', true);

		try {
			const result = await deleteCertificateById(certificateId);
			if (result) {
				await sendLog({
					message: 'Certificate deleted',
					client: interaction.client,
					type: 'success',
					command: 'certificate-delete',
					user: interaction.user.tag,
					guild: interaction.guild?.name,
					data: { certificateId },
				});
				return interaction.reply({
					content: `Certificate with ID ${certificateId} has been deleted successfully.`,
					flags: MessageFlags.Ephemeral,
				});
			}
			await sendLog({
				message: 'Certificate not found for deletion',
				client: interaction.client,
				type: 'warning',
				command: 'certificate-delete',
				user: interaction.user.tag,
				guild: interaction.guild?.name,
				data: { certificateId },
			});
			return interaction.reply({
				content: `Certificate with ID ${certificateId} not found.`,
				flags: MessageFlags.Ephemeral,
			});
		}
		catch (error) {
			await sendLog({
				message: 'Error deleting certificate',
				client: interaction.client,
				type: 'error',
				command: 'certificate-delete',
				user: interaction.user.tag,
				guild: interaction.guild?.name,
				data: { certificateId, error: error.message },
			});
			return interaction.reply({
				content: 'An error occurred while trying to delete the certificate.',
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};

// delete the certificate with the given ID
// return true if deleted, false if not found

