const { SlashCommandBuilder } = require('@discordjs/builders');
const { skip } = require('./play');
const utils = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips a song!'),
	async execute(interaction, sentry, transaction) {
		if (await utils(interaction.guildId, interaction.member.id)) {
			await interaction.deleteReply();
			transaction.finish();
		}
		skip();
		interaction.reply({ content: 'Skipped' });
		transaction.finish();
	},
};
