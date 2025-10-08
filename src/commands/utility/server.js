/** @type {import('../index.js').Command} */

export default {
	data: {
		name: 'server',
		description: 'Provides information about the server.',
	},
	async execute(interaction) {
		await interaction.reply(`This command was run by ${interaction.guild.name}, and has ${interaction.guild.memberCount} members.`);
	},
};

console.log("server.js loaded.");