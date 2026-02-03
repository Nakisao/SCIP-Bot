/* eslint-disable no-inline-comments */
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { sendLog } = require('../../../util/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('discord-unban')
		.setDescription('Unbans a user by their ID.')
		.addStringOption(option => // Must use string option for user ID as banned users are not cached members
			option
				.setName('target_id')
				.setDescription('The ID of the user to unban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for the unban')
				.setRequired(true))
		.addBooleanOption(option =>
			option
				.setName('global')
				.setDescription('Whether to unban the user from all guilds the bot is in (Requires Ban Members permission)'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Unban requires the same permission

	async execute(interaction) {
		// Ensure the command is not run in a DM.
		if (!interaction.inGuild()) {
			return interaction.reply({
				content: 'This command can only be used in a server.',
				flags: MessageFlags.Ephemeral,
			});
		}

		const targetId = interaction.options.getString('target_id', true);
		const reason = interaction.options.getString('reason', true);
		const isGlobal = interaction.options.getBoolean('global') ?? false;

		// Check if the target is the bot itself.
		if (targetId === interaction.client.user.id) {
			return interaction.reply({
				// eslint-disable-next-line quotes
				content: "I cannot unban myself. That's a strange thing to ask.",
				flags: MessageFlags.Ephemeral,
			});
		}

		// --- Global Unban Logic ---
		if (isGlobal) {
			const unbannedGuildsCount = { success: 0, failed: 0 };
			const totalGuilds = interaction.client.guilds.cache.size;

			await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Defer to prevent timeout for global operation

			for (const guild of interaction.client.guilds.cache.values()) {
				const botMember = guild.members.me;

				if (!botMember || !botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
					// Skip if bot doesn't have permission
					continue;
				}

				try {
					// Attempt to remove the ban
					await guild.bans.remove(targetId, reason);
					unbannedGuildsCount.success++;
				}
				catch (error) {
					// Log the specific error (e.g., user not banned in this guild)
					await sendLog({
						message: `[GLOBAL UNBAN FAIL] Failed to unban ID ${targetId} in ${guild.name}`,
						client: interaction.client,
						type: 'error',
						command: 'discord-unban',
						user: targetId,
						guild: guild.name,
						data: { error: error.message, guildId: guild.id },
					});
					unbannedGuildsCount.failed++;
				}
			}

			let replyContent;

			if (unbannedGuildsCount.success > 0) {
				replyContent = `✅ Global unban complete for ID **${targetId}** (Reason: \`${reason}\`).\n\n`
                    + `**Unbanned in ${unbannedGuildsCount.success} out of ${totalGuilds} connected guilds.**`;

				if (unbannedGuildsCount.failed > 0) {
					replyContent += `\n*Note: Failed to unban in ${unbannedGuildsCount.failed} guild(s). This usually means the user was not banned there.*`;
				}
				await sendLog({
					message: 'Successfully unbanned user globally',
					client: interaction.client,
					type: 'success',
					command: 'discord-unban',
					user: targetId,
					data: { unbannedIn: unbannedGuildsCount.success, totalGuilds: totalGuilds, global: isGlobal },
				});
			}
			else {
				replyContent = `❌ Global unban failed for ID **${targetId}**. I was unable to unban the user from any of the ${totalGuilds} guilds. `
                    + 'The user may not be banned anywhere, or I might be missing the `Ban Members` permission.';
				await sendLog({
					message: 'Failed to unban user globally',
					client: interaction.client,
					type: 'error',
					command: 'discord-unban',
					user: targetId,
					data: { global: isGlobal, reason: 'User possibly not banned or permissions missing' },
				});
			}

			// The deferred reply must be edited (not replied to again)
			return interaction.editReply({
				content: replyContent,
				flags: MessageFlags.Ephemeral,
			});

		}
		// --- Single Guild Unban Logic ---
		else {
			try {
				// Check if the user is actually banned before attempting (optional but helpful for clearer errors)
				// Note: guild.bans.fetch will throw if the user is not found
				await interaction.guild.bans.fetch(targetId);

				// Attempt to unban the user
				await interaction.guild.bans.remove(targetId, reason);

				await interaction.reply({
					content: `✅ Successfully unbanned ID **${targetId}** from **${interaction.guild.name}** for reason: \`\`\`${reason}\`\`\``,
				});
				await sendLog({
					message: 'Successfully unbanned user',
					client: interaction.client,
					type: 'success',
					command: 'discord-unban',
					user: targetId,
					guild: interaction.guild.name,
					data: { reason: reason, global: isGlobal },
				});
			}
			catch (error) {
				let errorMessage;

				if (error.code === 10026) { // Unknown Ban / Not Banned
					errorMessage = `❌ Failed to unban ID **${targetId}**. This user is not currently banned in this server.`;
				}
				else {
					errorMessage = `❌ Failed to unban ID **${targetId}**. An unexpected error occurred. Do I have the \`Ban Members\` permission?`;
				}

				await sendLog({
					message: 'Failed to unban user',
					client: interaction.client,
					type: 'error',
					command: 'discord-unban',
					user: targetId,
					guild: interaction.guild.name,
					data: { error: error?.message ?? error, global: isGlobal },
				});

				await interaction.reply({
					content: errorMessage,
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	},
};