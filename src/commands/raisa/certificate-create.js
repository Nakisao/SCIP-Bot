const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createCertificate } = require('../../../raisa/certificates');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('certificate-create')
		.setDescription('Creates a RAISA certificate.')
		.addStringOption(option =>
			option
				.setName('description')
				.setDescription('A short description for the certificate')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('appoint_rank')
				.setDescription('Role or rank that can appoint this certificate')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		if (!interaction.inGuild()) {
			return interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
		}

		const description = interaction.options.getString('description', true);
		const appointRank = interaction.options.getString('appoint_rank', false);

		try {
			await interaction.deferReply({ ephemeral: true });
			const cert = await createCertificate({ description, appointRank });
			return interaction.editReply({ content: `Certificate created with ID ${cert.certificateId}.`, flags: MessageFlags.Ephemeral });
		}
		catch (error) {
			console.error('Error creating certificate:', error);
			if (interaction.deferred || interaction.replied) {
				return interaction.editReply({ content: 'An error occurred while creating the certificate.', flags: MessageFlags.Ephemeral });
			}
			return interaction.reply({ content: 'An error occurred while creating the certificate.', flags: MessageFlags.Ephemeral });
		}
	},
};

console.log('Loaded certificate-create.js');