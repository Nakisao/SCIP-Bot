// const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('discord-ban')
//         .setDescription('[DISABLED] Bans a user from one or more guilds.'),
//         // .addUserOption(option =>
//         //     option
//         //         .setName('target')
//         //         .setDescription('The user to ban')
//         //         .setRequired(true))
//         // .addStringOption(option =>
//         //     option
//         //         .setName('reason')
//         //         .setDescription('The reason for the ban')
//         //         .setRequired(true))
//         // .addBooleanOption(option =>
//         //     option
//         //         .setName('global')
//         //         .setDescription('Whether to ban the user from all guilds the bot is in'))
//         // .addNumberOption(option =>
//         //     option
//         //         .setName('duration_hours')
//         //         .setDescription('The number of hours to temporarily ban the user')),
//         // .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
//         async execute(interaction){
//             await interaction.reply('This command is disabled!');
//         },
//     // async execute(interaction) {
//     //     // Ensure the command is not run in a DM.
//     //     if (!interaction.inGuild()) {
//     //         return interaction.reply({
//     //             content: 'This command can only be used in a server.',
//     //             ephemeral: true
//     //         });
//     //     }

//     //     const targetUser = interaction.options.getUser('target');
//     //     const reason = interaction.options.getString('reason');
//     //     const isGlobal = interaction.options.getBoolean('global') || false;
//     //     const durationHours = interaction.options.getNumber('duration_hours');

//     //     // Check if the target is the bot itself.
//     //     if (targetUser.id === interaction.client.user.id) {
//     //         return interaction.reply({
//     //             content: 'I cannot ban myself.',
//     //             ephemeral: true
//     //         });
//     //     }

//     //     // Handle temporary bans.
//     //     if (durationHours) {
//     //         return interaction.reply({
//     //             content: 'Temporary bans are not yet implemented in this command.',
//     //             ephemeral: true
//     //         });
//     //     }

//     //     if (isGlobal) {
//     //         // Global ban logic
//     //         let bannedGuilds = [];
//     //         const guilds = interaction.client.guilds.cache.values();

//     //         for (const guild of guilds) {
//     //             try {
//     //                 await guild.members.ban(targetUser.id, { reason });
//     //                 bannedGuilds.push(guild.name);
//     //             } catch (error) {
//     //                 // Do nothing if the bot cannot ban the user in a specific guild.
//     //             }
//     //         }

//     //         if (bannedGuilds.length > 0) {
//     //             await interaction.reply({
//     //                 content: `Successfully globally banned **${targetUser.tag}** for reason: \`\`\`${reason}\`\`\`\nBanned in: ${bannedGuilds.join(', ')}`,
//     //                 ephemeral: false
//     //             });
//     //         } else {
//     //             await interaction.reply({
//     //                 content: `Failed to ban **${targetUser.tag}** from any guilds.`,
//     //                 ephemeral: true
//     //             });
//     //         }
//     //     } else {
//     //         // Single guild ban logic
//     //         const memberToBan = interaction.guild.members.cache.get(targetUser.id);
//     //         if (memberToBan && !memberToBan.bannable) {
//     //             return interaction.reply({
//     //                 content: `I cannot ban this user. They may have a higher role than me or be the server owner.`,
//     //                 ephemeral: true
//     //             });
//     //         }

//     //         try {
//     //             await interaction.guild.members.ban(targetUser.id, { reason });
//     //             await interaction.reply({
//     //                 content: `Successfully banned **${targetUser.tag}** for reason: \`\`\`${reason}\`\`\``,
//     //                 ephemeral: false
//     //             });
//     //         } catch (error) {
//     //             console.error(error);
//     //             await interaction.reply({
//     //                 content: `Failed to ban **${targetUser.tag}**. An unexpected error occurred.`,
//     //                 ephemeral: true
//     //             });
//     //         }
//     //     }
//     // }
// };

console.log("discordban.js loaded but doesn't have any actual function.");