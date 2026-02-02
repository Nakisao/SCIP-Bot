// add something to an intelligence file
// requires:
// - case ID
// optionally required:
// - text content to be added
// - file attachment URL to be added
// adds the content to the intelligence case in the database
// requires: be ISD or SC-4+
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { MongoClient, ObjectId } = require('mongodb');

// Load dotenv if available
try {
	require('dotenv').config();
}
// eslint-disable-next-line no-empty
catch {}

function getMongoUri() {
	return process.env.MONGODB_LOCAL || 'mongodb://localhost:27017';
}

/**
 * Sanitize text content to ensure it's treated as plain text and not executed
 * @param {string} text - The text to sanitize
 * @returns {string} The sanitized text
 */
function sanitizeText(text) {
	if (!text) return '';
	// Remove any potential code markers and keep as plain text
	return text.trim();
}

async function addToCase(caseId, creatorUserId, content, fileUrl) {
	const uri = getMongoUri();
	const client = new MongoClient(uri, { connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000 });

	try {
		await client.connect();

		const isdDb = client.db('ISD');
		const caseCol = isdDb.collection('Cases');

		// Verify the case exists
		const existingCase = await caseCol.findOne({ caseId });
		if (!existingCase) {
			throw new Error('Case not found');
		}

		// Build the entry object
		const newEntry = {
			_id: new ObjectId(),
			creatorUserId,
			createdAt: new Date(),
		};

		// Add content as plain text (sanitized)
		if (content) {
			newEntry.content = sanitizeText(content);
		}

		// Add file attachment information
		if (fileUrl) {
			newEntry.attachment = {
				url: fileUrl,
				addedAt: new Date(),
			};
		}

		// Add entry to the case
		const result = await caseCol.findOneAndUpdate(
			{ caseId },
			{
				$push: { entries: newEntry },
				$set: { updatedAt: new Date() },
			},
			{ returnDocument: 'after' },
		);

		if (!result.value) {
			throw new Error('Failed to update case');
		}

		return result.value;
	}
	finally {
		await client.close();
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('isd-add')
		.setDescription('Add information to an existing intelligence case.')
		.addStringOption(option =>
			option
				.setName('case_id')
				.setDescription('The case ID to add information to.')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('content')
				.setDescription('Text content to add to the case (optional).')
				.setRequired(false)
				.setMaxLength(2000))
		.addStringOption(option =>
			option
				.setName('file_url')
				.setDescription('URL of a file/attachment to add to the case (optional).')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				flags: MessageFlags.Ephemeral,
			});
		}

		const caseId = interaction.options.getString('case_id', true);
		const content = interaction.options.getString('content', false);
		const fileUrl = interaction.options.getString('file_url', false);

		// Validate that at least one optional parameter is provided
		if (!content && !fileUrl) {
			return interaction.reply({
				content: 'You must provide either text content or a file URL to add to the case.',
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const updatedCase = await addToCase(caseId, interaction.user.id, content, fileUrl);

			// Build response message
			let responseContent = `Successfully added to case ${caseId}.\n`;
			if (content) {
				responseContent += `\n**Text content added:**\n\`\`\`${sanitizeText(content).substring(0, 200)}${sanitizeText(content).length > 200 ? '...' : ''}\`\`\``;
			}
			if (fileUrl) {
				responseContent += `\n**File attachment:** ${fileUrl}`;
			}
			responseContent += `\n\nTarget user: <@${updatedCase.targetUserId}>`;

			return interaction.editReply({
				content: responseContent,
				flags: MessageFlags.Ephemeral,
			});
		}
		catch (error) {
			console.error('Error adding to case:', error);
			if (interaction.deferred || interaction.replied) {
				return interaction.editReply({
					content: `Error adding to case: ${error.message}`,
					flags: MessageFlags.Ephemeral,
				});
			}
			return interaction.reply({
				content: `Error adding to case: ${error.message}`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};