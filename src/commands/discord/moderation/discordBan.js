/* eslint-disable no-inline-comments */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('discord-ban')
		.setDescription('Bans a user.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The user to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for the ban')
				.setRequired(true))
		.addBooleanOption(option =>
			option
				.setName('global')
				.setDescription('Whether to ban the user from all guilds the bot is in (Requires Administrator)'))
		.addIntegerOption(option => // Corrected to use addIntegerOption
			option
				.setName('delete_messages_days')
				.setDescription('Number of days of messages to delete (0-7)')
				.setMinValue(0)
				.setMaxValue(7))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction) {
		// Ensure the command is not run in a DM.
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				ephemeral: true,
			});
		}

		const targetUser = interaction.options.getUser('target', true);
		const reason = interaction.options.getString('reason', true);
		const isGlobal = interaction.options.getBoolean('global') ?? false;
		const durationHours = interaction.options.getNumber('duration_hours');
		const deleteDays = interaction.options.getInteger('delete_messages_days') ?? 0;
		const deleteMessageSeconds = deleteDays * 24 * 60 * 60;

		const banOptions = {
			reason: reason,
			deleteMessageSeconds: deleteMessageSeconds,
		};

		// Check if the target is the bot itself.
		if (targetUser.id === interaction.client.user.id) {
			return interaction.reply({
				// eslint-disable-next-line quotes
				content: "I cannot ban myself. What's wrong with you?",
				ephemeral: true,
			});
		}

		// Handle temporary bans (still noted as unimplemented)
		if (durationHours) {
			return interaction.reply({
				content: 'Temporary bans are not yet implemented in this command.',
				ephemeral: true,
			});
		}

		if (isGlobal) {
			// Global ban logic
			const bannedGuilds = [];

			for (const guild of interaction.client.guilds.cache.values()) {
				// Check for BANNABLE permission in the specific guild for the bot
				if (guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
					try {
						await guild.members.ban(targetUser.id, banOptions);
						bannedGuilds.push(guild.name);
					}
					// eslint-disable-next-line no-unused-vars
					catch (error) {
						continue;
					}
				}
			}

			if (bannedGuilds.length > 0) {
				await interaction.reply({
					content: `✅ Successfully globally banned **${targetUser.tag}** for reason: \`\`\`${reason}\`\`\`\nBanned in: **${bannedGuilds.join(', ')}**`,
					ephemeral: false,
				});
			}
			else {
				await interaction.reply({
					content: `❌ Failed to ban **${targetUser.tag}** from any guilds. I might not have the \`Ban Members\` permission.`,
					ephemeral: true,
				});
			}
		}
		else {
			// Single guild ban logic
			const memberToBan = interaction.guild.members.cache.get(targetUser.id);

			if (memberToBan && !memberToBan.bannable) {
				return interaction.reply({
					content: '❌ I cannot ban this user. They may have a higher role than me or be the server owner.',
					ephemeral: true,
				});
			}

			try {
				await interaction.guild.members.ban(targetUser.id, banOptions);
				await interaction.reply({
					content: `✅ Successfully banned **${targetUser.tag}** from **${interaction.guild.name}** for reason: \`\`\`${reason}\`\`\``,
					ephemeral: false,
				});
			}
			catch (error) {
				console.error(error);
				await interaction.reply({
					content: `❌ Failed to ban **${targetUser.tag}**. An unexpected error occurred. Do I have the \`Ban Members\` permission?`,
					ephemeral: true,
				});
			}
		}
	},
};

console.log('discordban.js loaded.');