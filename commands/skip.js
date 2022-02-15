const { SlashCommandBuilder } = require('@discordjs/builders');
const { skip } = require('./play');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips a song!'),
	async execute(interaction) {
		skip();
		interaction.reply('Skipped');
	},
};
