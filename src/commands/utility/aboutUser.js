/* eslint-disable no-unused-vars */

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const moment = require('moment');

// Define the main guild ID
const MAIN_GUILD_ID = '1345631743935381534';

// Define the role priority list
const ROLE_PRIORITY = [
	{ name: 'The Administrator', id: '1345632015139213363' },
	{ name: 'Founders', id: '1355735264537870477' },
	{ name: 'The Administrator\'s Assistants', id: '1345632635472576562' },
	{ name: 'Bots', id: '1345635351401857106' },
	{ name: 'Council Chairperson', id: '1345632563665965136' },
	{ name: 'Council Oversight', id: '1345636203919052810' },
	{ name: 'Site Director', id: '1345635866261065759' },
	{ name: 'Head of Moderation', id: '1345635867041202176' },
	{ name: 'Community Executor', id: '1345635867640725604' },
	{ name: 'SC-5', id: '1345635873957613660' },
	{ name: 'Community Manager', id: '1345635868437647360' },
	{ name: 'SC-4', id: '1345635875240804443' },
	{ name: 'Sr. Community Mod', id: '1345635869247410197' },
	{ name: 'Community Mod', id: '1345635870073688124' },
	{ name: 'Jr. Community Mod', id: '1345635870820270100' },
	{ name: 'Trial Mod', id: '1345635871969247303' },
	{ name: 'SC-3', id: '1345635875429552211' },
	{ name: 'SC-2', id: '1345637052300918815' },
	{ name: 'SC-1', id: '1345637052531736588' },
	{ name: 'SC-0', id: '1345637052871475231' },
	{ name: 'C-D', id: '1345637054326898769' },
	{ name: 'C-E', id: '1345661375107563551' },
	{ name: 'Not in Group', id: '1345661614665371700' },
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about-user')
		.setDescription('Provides information about a specified user.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The user to run this command on.')
				.setRequired(true)),
	async execute(interaction) {
		// 1. Filter: Check if the interaction is from the main guild
		if (interaction.guildId !== MAIN_GUILD_ID) {
			return interaction.reply({
				content: 'This command can only be run in the main server.',
				flags: MessageFlags.Ephemeral,
			});
		}

		// Get the target user object
		const targetUser = interaction.options.getUser('target');

		// Fetch the main guild object
		const mainGuild = await interaction.client.guilds.fetch(MAIN_GUILD_ID);

		// Fetch the target member object from the main guild (needed for joinDate and roles)
		let targetMember;
		try {
			targetMember = await mainGuild.members.fetch(targetUser.id);
		}
		catch (error) {
			// Handle case where the target user is NOT a member of the main guild
			return interaction.reply({
				content: `The user **${targetUser.tag}** is not a member of the main server.`,
				flags: MessageFlags.Ephemeral,
			});
		}

		// 1. Get user joined date
		const joinedDate = targetMember.joinedAt;
		// Check if joinedDate exists (it should, but good practice)
		const formattedJoinedDate = joinedDate ? moment(joinedDate).format('MMM Do YYYY, h:mm A [UTC]') : 'N/A';

		// 2. Get account creation date
		const creationDate = targetUser.createdAt;
		const formattedCreationDate = moment(creationDate).format('MMM Do YYYY, h:mm A [UTC]');

		// 3. Determine highest role based on the priority list
		let highestRoleName = 'None (or @everyone)';

		for (const priorityRole of ROLE_PRIORITY) {
			// Check if the member has the current role ID
			if (targetMember.roles.cache.has(priorityRole.id)) {
				highestRoleName = priorityRole.name;
				// Since the list is ordered from highest to lowest, the first match is the highest.
				break;
			}
		}

		// Construct the reply message
		const replyMessage =
            `User Information for **${targetUser.tag}**\n` +
			'---' +
            `\nMain Server Joined: **${formattedJoinedDate}**\n` +
            `Account Created: **${formattedCreationDate}**\n` +
            `Highest Tracked Role: **${highestRoleName}**`;

		await interaction.reply({ content: replyMessage });
	},
};

console.log('user.js loaded.');