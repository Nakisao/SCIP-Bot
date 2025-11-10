// deletes a RAISA certificate by its ID.
// requires administrator
// const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
// const { deleteCertificateById } = require('../../../raisa/certificates');

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('certificate-delete')
//         .setDescription('Deletes a RAISA certificate by its ID.')
//         .addStringOption(option =>
//             option
//                 .setName('certificate_id')
//                 .setDescription('The ID of the certificate to delete')
//                 .setRequired(true))
//         .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
//     async execute(interaction) {
//         // Ensure the command is not run in a DM.
//         if (!interaction.inGuild()) {
//             return interaction.reply({
//                 content: 'This command can only be used in a server.',
//                 ephemeral: true,
//             });
//         }
//         const certificateId = interaction.options.getString('certificate_id', true);

//         try {
//             const result = await deleteCertificateById(certificateId);
//             if (result) {
//                 return interaction.reply({
//                     content: `Certificate with ID ${certificateId} has been deleted successfully.`,
//                     ephemeral: true,
//                 });
//             }
//             return interaction.reply({
//                 content: `Certificate with ID ${certificateId} not found.`,
//                 ephemeral: true,
//             });
//         }
//        catch (error) {
//             console.error('Error deleting certificate:', error);
//             return interaction.reply({
//                 content: 'An error occurred while trying to delete the certificate.',
//                 ephemeral: true,
//             });
//         }
//     },
// };

console.log('Loaded certificate-delete.js');
