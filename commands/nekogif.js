const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('nekos.life');
const { nsfw } = new client();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nekogif')
		.setDescription('Cute gifs of nekos only here'),
	async execute(interaction) {
		if (interaction.channel.nsfw == true) {
			interaction.reply({ files: [await nsfw.nekoGif()] });
		}
		else {
			interaction.reply({ content: 'Only NSFW channel' });
		}
	},
};