const { SlashCommandBuilder } = require('@discordjs/builders');
const { skip } = require('../modules/music.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip a song'),
	async execute(interaction) {
		skip(interaction);
	},
};