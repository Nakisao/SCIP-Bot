// delete an entire case outright from ISD
// requires: case ID
// requires: be SC-4+ or ISD
// deletes from MongoDB entirely

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { MongoClient } = require('mongodb');
const { sendLog } = require('../../../util/logger');

// Load dotenv if available
try {
	require('dotenv').config();
}
// eslint-disable-next-line no-empty
catch {}

function getMongoUri() {
	return process.env.MONGODB_LOCAL || 'mongodb://localhost:27017';
}

async function deleteCase(caseId) {
	const uri = getMongoUri();
	const client = new MongoClient(uri, { connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000 });

	try {
		await client.connect();

		// First, check ISD/Cases
		const isdDb = client.db('ISD');
		const isdCol = isdDb.collection('Cases');
		let caseToDelete = await isdCol.findOne({ caseId });

		if (caseToDelete) {
			// Delete from ISD/Cases
			const deleteResult = await isdCol.deleteOne({ caseId });

			if (deleteResult.deletedCount === 0) {
				throw new Error('Failed to delete case from ISD database');
			}

			return { ...caseToDelete, source: 'ISD' };
		}

		// If not found in ISD, check RAISA/Archives
		const raisaDb = client.db('RAISA');
		const archiveCol = raisaDb.collection('Archives');
		caseToDelete = await archiveCol.findOne({ caseId });

		if (caseToDelete) {
			// Delete from RAISA/Archives
			const deleteResult = await archiveCol.deleteOne({ caseId });

			if (deleteResult.deletedCount === 0) {
				throw new Error('Failed to delete case from RAISA archives');
			}

			return { ...caseToDelete, source: 'RAISA Archives' };
		}

		// Case not found in either location
		throw new Error('Case not found in ISD database or RAISA archives');
	}
	finally {
		await client.close();
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('isd-delete-case')
		.setDescription('Permanently delete an intelligence case file.')
		.addStringOption(option =>
			option
				.setName('case_id')
				.setDescription('The case ID to delete.')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for deleting the case.')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				flags: MessageFlags.Ephemeral,
			});
		}

		const caseId = interaction.options.getString('case_id', true);
		const reason = interaction.options.getString('reason', true);

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const deletedCase = await deleteCase(caseId);

			await sendLog({
				message: 'Case permanently deleted',
				client: interaction.client,
				type: 'success',
				command: 'isd-delete-case',
				user: interaction.user.tag,
				guild: interaction.guild?.name,
				data: { caseId: caseId, deletedBy: interaction.user.tag, targetUserId: deletedCase.targetUserId, source: deletedCase.source, reason: reason },
			});

			return interaction.editReply({
				content: `Case ${caseId} has been permanently deleted from ${deletedCase.source}.\nTarget user: <@${deletedCase.targetUserId}>\nDeleted by: ${interaction.user.tag}\nReason: ${reason}`,
				flags: MessageFlags.Ephemeral,
			});
		}
		catch (error) {
			await sendLog({
				message: 'Error deleting case',
				client: interaction.client,
				type: 'error',
				command: 'isd-delete-case',
				user: interaction.user.tag,
				guild: interaction.guild?.name,
				data: { error: error?.message ?? error, caseId: caseId },
			});
			if (interaction.deferred || interaction.replied) {
				return interaction.editReply({
					content: 'An error occurred while deleting the case file.',
					flags: MessageFlags.Ephemeral,
				});
			}
			return interaction.reply({
				content: 'An error occurred while deleting the case file.',
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};