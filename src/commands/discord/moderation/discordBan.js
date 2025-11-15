/* eslint-disable no-inline-comments */
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
console.warn('Loading discordBan.js...');
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
				.setDescription('Whether to ban the user from all guilds the bot is in (Requires Administrator)')) // it really just requires a rank
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
				flags: MessageFlags.Ephemeral, // FIXED: Replaced ephemeral: true
			});
		}

		const targetUser = interaction.options.getUser('target', true);
		const reason = interaction.options.getString('reason', true);
		const isGlobal = interaction.options.getBoolean('global') ?? false;

		// If this command may perform long-running actions (e.g. global bans across many guilds),
		// defer the reply so Discord doesn't expire the interaction token. We'll edit the
		// deferred reply later with the result.
		if (isGlobal) {
			try {
				await interaction.deferReply({ ephemeral: true });
			}
			catch (err) {
				// If deferring fails, log and continue — later reply attempts will be guarded.
				console.error('Failed to defer reply for global ban:', err?.message ?? err);
			}
		}
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
				flags: MessageFlags.Ephemeral, // FIXED: Replaced ephemeral: true
			});
		}

		// Handle temporary bans (still noted as unimplemented)
		if (durationHours) {
			return interaction.reply({
				content: 'Temporary bans are not yet implemented in this command.',
				flags: MessageFlags.Ephemeral, // FIXED: Replaced ephemeral: true
			});
		}

		if (isGlobal) {
			// Global ban logic
			const bannedGuildsCount = { success: 0, failed: 0 };
			const failedGuildDetails = []; // To store error messages for console logging
			const totalGuilds = interaction.client.guilds.cache.size;


			for (const guild of interaction.client.guilds.cache.values()) {
				// Ensure the bot has the BanMembers permission in this specific guild
				const botMember = guild.members.me;

				if (!botMember || !botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
					// Skip if bot doesn't have permission (this is expected for some guilds)
					continue;
				}

				try {
					await guild.members.ban(targetUser.id, banOptions);
					bannedGuildsCount.success++;
				}
				catch (error) {
					// Log the specific error instead of failing silently
					console.error(`[GLOBAL BAN FAIL] Failed to ban ${targetUser.tag} in ${guild.name} (${guild.id}):`, error.message);
					bannedGuildsCount.failed++;
					failedGuildDetails.push(guild.name);
				}
			}

			let replyContent;
			let replyFlags = 0; // Default to public

			if (bannedGuildsCount.success > 0) {
				replyContent = `✅ Global ban complete for **${targetUser.tag}** (Reason: \`${reason}\`).\n\n`
                    + `**Banned in ${bannedGuildsCount.success} out of ${totalGuilds} connected guilds.**`;

				if (bannedGuildsCount.failed > 0) {
					replyContent += `\n*Note: Failed to ban in ${bannedGuildsCount.failed} guild(s). Reasons logged in the console (e.g., bot missing permissions).*`;
					replyFlags = MessageFlags.Ephemeral; // Make the response ephemeral if there were failures
				}
			}
			else {
				replyContent = `❌ Global ban failed for **${targetUser.tag}**. I was unable to ban the user from any of the ${totalGuilds} guilds. `
                    + 'Ensure I have the `Ban Members` permission in the guilds and check the console for specific errors.';
				replyFlags = MessageFlags.Ephemeral;
			}

			// If we deferred earlier (slow/global path), update the deferred reply. Otherwise use reply.
			if (interaction.deferred) {
				// editReply updates the existing deferred response; flags were set during deferReply.
				await interaction.editReply({ content: replyContent });
			}
			else {
				await interaction.reply({
					content: replyContent,
					flags: replyFlags,
				});
			}

		}
		else {
			// Single guild ban logic
			const memberToBan = interaction.guild.members.cache.get(targetUser.id);

			if (memberToBan && !memberToBan.bannable) {
				return interaction.reply({
					content: '❌ I cannot ban this user. They may have a higher role than me or be the server owner.',
					flags: MessageFlags.Ephemeral, // FIXED: Replaced ephemeral: true
				});
			}

			try {
				await interaction.guild.members.ban(targetUser.id, banOptions);
				await interaction.reply({
					content: `✅ Successfully banned **${targetUser.tag}** from **${interaction.guild.name}** for reason: \`\`\`${reason}\`\`\``,
					// ephemeral: false is the default, so we remove it.
				});
			}
			catch (error) {
				console.error(error);
				await interaction.reply({
					content: `❌ Failed to ban **${targetUser.tag}**. An unexpected error occurred. Do I have the \`Ban Members\` permission?`,
					flags: MessageFlags.Ephemeral, // FIXED: Replaced ephemeral: true
				});
			}
		}
	},
};

console.log('discordban.js loaded.');