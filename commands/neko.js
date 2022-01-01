const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('nekos.life');
const { nsfw } = new client();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('neko')
		.setDescription('Cute nekos only here'),
	async execute(interaction) {
		interaction.reply({ files: [await nsfw.neko()] });
	},
};