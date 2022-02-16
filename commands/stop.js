const { SlashCommandBuilder } = require('@discordjs/builders');
const { server } = require('../index');
const utils = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop!'),
	async execute(interaction, sentry, transaction) {
		if (await utils.checkBlocked(interaction.guildId, interaction.member.id)) {
			await interaction.deleteReply();
			transaction.finish();
		}
		const temp = server.get(interaction.guildId);
		if (interaction.client.voice.adapters.has(interaction.guildId)
			&& temp.voice === interaction.member.voice.channelId) {
			await interaction.client.voice.adapters.get(interaction.guildId).destroy();
			server.delete(interaction.guildId);
			interaction.reply({ content: 'Stopped!' });
		}
		else {
			interaction.reply({ content: 'Nothing to stop!' });
		}
		transaction.finish();
	},
};
