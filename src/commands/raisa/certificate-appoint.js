// appoint a RAISA certificate to a user (permits IDs)
// *requires user to be verified with the bot
// *appointer requires RAISA Certificate role specified
// can be a name or RAISA certificate ID to appoint
// would rely on the verification system to find the user to appoint to

// how to add:
// navigate to (DB) localhost/RAISA/Verified_Users
// add a new entry with the following format:
// "RAISA Certificate ID": "Discord User ID"
// example: "RAISA-1234": "123456789012345678"
// additional entries can be added for multiple certificates
// also includes ISD caseIDs.

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getUserByCertificateID, addCertificateToUser } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('appoint')
        .setDescription('Appoint a RAISA certificate to a user')
        .addStringOption(option =>
            option.setName('certificate')
                .setDescription('RAISA Certificate ID or name')
                .setRequired(true)),
    async execute(interaction) {
        const certificateInput = interaction.options.getString('certificate');
        const appointer = interaction.member;