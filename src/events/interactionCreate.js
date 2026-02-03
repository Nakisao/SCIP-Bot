const { Events, MessageFlags, Collection } = require('discord.js');
const { sendLog } = require('../util/logger');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// chat cmds
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			await sendLog({
				message: `No command matching ${interaction.commandName} was found`,
				client: interaction.client,
				type: 'error',
				command: 'interactionCreate',
				user: interaction.user.tag,
				guild: interaction.guild?.name,
				data: { commandName: interaction.commandName },
			});
			return;
		}

		const { cooldowns } = interaction.client;

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = 3;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1000);
				return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, flags: MessageFlags.Ephemeral });
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		try {
			await command.execute(interaction);
		}
		catch (error) {
			await sendLog({
				message: 'Error executing command',
				client: interaction.client,
				type: 'error',
				command: interaction.commandName,
				user: interaction.user.tag,
				guild: interaction.guild?.name,
				data: { error: error.message },
			});
			// The interaction may have expired or otherwise become invalid by the time we
			// try to notify the user. Wrap reply/followUp attempts to avoid throwing an
			// unhandled exception (e.g., DiscordAPIError[10062]: Unknown interaction).
			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
				}
				else {
					await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
				}
			}
			catch (replyError) {
				await sendLog({
					message: 'Failed to send error response to interaction',
					client: interaction.client,
					type: 'error',
					command: 'interactionCreate',
					user: interaction.user.tag,
					guild: interaction.guild?.name,
					data: { error: replyError?.message ?? String(replyError) },
				});
			}
		}
	},
};