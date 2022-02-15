const { SlashCommandBuilder } = require('@discordjs/builders');
const { server } = require('../index');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop!'),
	async execute(interaction) {
		const temp = server.get(interaction.guildId);
		if (interaction.client.voice.adapters.has(interaction.guildId)
			&& temp.voice === interaction.member.voice.channelId) {
			await interaction.client.voice.adapters.get(interaction.guildId).destroy();
			server.delete(interaction.guildId);
			interaction.reply('Stopped!');
		}
		else {
			interaction.reply('Nothing to stop!');
		}
	},
};
