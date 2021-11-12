const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restart')
		.setDescription('Restarts the bot (Admins only)')
		.addStringOption(option => option.setName('url').setDescription('Enter a url').setRequired(true)),
	async execute(interaction) {
		if (interaction.author.roles.has('722565721703317595')) {
			interaction.reply({ content: 'Restarted', ephemeral: true });
			process.exit(0);
		}
		interaction.reply({ content: 'You can\'t do that', ephemeral: true });
	},
};