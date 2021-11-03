const { SlashCommandBuilder } = require('@discordjs/builders');
const { play } = require('../modules/music.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays music')
		.addStringOption(option => option.setName('url').setDescription('Enter a url').setRequired(true)),
	async execute(interaction) {
		play(interaction);
	},
};