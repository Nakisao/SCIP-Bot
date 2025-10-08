/** @type {import('../index.js').Command} */
export default {
	data: {
		name: 'user',
		description: 'Provides information about the user.',
	},
	async execute(interaction) {
		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
	},
};

console.log("user.js loaded.");