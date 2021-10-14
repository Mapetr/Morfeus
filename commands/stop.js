const { SlashCommandBuilder } = require('@discordjs/builders');
const { stop } = require('../modules/music.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops music'),
	async execute(interaction) {
		stop(interaction);
	},
};