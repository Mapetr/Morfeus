const { SlashCommandBuilder } = require('@discordjs/builders');
const { destroy, isConnected } = require('./play.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops music'),
	async execute(interaction) {
		if (!isConnected(interaction)) {
			interaction.editReply({ content: 'Nothing to stop' });
			return;
		}
		destroy(interaction);
		interaction.editReply({ content: 'Stopped playing!' });
	},
};