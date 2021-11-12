const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cicina')
		.setDescription('Measure your cicina size'),
	async execute(interaction) {
		interaction.reply({ content: `Tvoje cicina je hluboka ${Math.floor(Math.random() * (30 - 1) + 1)} cm` });
	},
};