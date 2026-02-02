// Archive an intelligence file and move it to RAISA Archives
// requires: user that the file is associated with (ID)
// requires: be SC-4+ or ISD
// delete from MongoDB ISD and move it to RAISA Archives

const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { MongoClient } = require('mongodb');

// Load dotenv if available
try {
	require('dotenv').config();
}
// eslint-disable-next-line no-empty
catch {}

function getMongoUri() {
	return process.env.MONGODB_LOCAL || 'mongodb://localhost:27017';
}

async function archiveCase(caseId) {
	const uri = getMongoUri();
	const client = new MongoClient(uri, { connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000 });

	try {
		await client.connect();

		// Get the case from ISD/Cases
		const isdDb = client.db('ISD');
		const isdCol = isdDb.collection('Cases');
		const caseToArchive = await isdCol.findOne({ caseId });

		if (!caseToArchive) {
			throw new Error('Case not found in ISD database');
		}

		// Move to RAISA/Archives
		const raisaDb = client.db('RAISA');
		const archiveCol = raisaDb.collection('Archives');

		// Add archived timestamp
		const archivedCase = {
			...caseToArchive,
			archivedAt: new Date(),
		};

		await archiveCol.insertOne(archivedCase);

		// Delete from ISD/Cases
		const deleteResult = await isdCol.deleteOne({ caseId });

		if (deleteResult.deletedCount === 0) {
			throw new Error('Failed to delete case from ISD database');
		}

		return archivedCase;
	}
	finally {
		await client.close();
	}
}

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

		const caseId = interaction.options.getString('case_id', true);

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const archivedCase = await archiveCase(caseId);

			return interaction.editReply({
				content: `Case ${caseId} has been successfully archived.\nTarget user: <@${archivedCase.targetUserId}>\nArchived at: ${new Date(archivedCase.archivedAt).toLocaleString()}`,
				flags: MessageFlags.Ephemeral,
			});
		}
		catch (error) {
			console.error('Error archiving case:', error);
			if (interaction.deferred || interaction.replied) {
				return interaction.editReply({
					content: `Error archiving case: ${error.message}`,
					flags: MessageFlags.Ephemeral,
				});
			}
			return interaction.reply({
				content: `Error archiving case: ${error.message}`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};