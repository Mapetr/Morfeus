const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionResponseType } = require('discord-api-types');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cicina')
		.setDescription('Measure your cicina size'),
	async execute(interaction) {
		interaction.editReply({ content: `Tvoje cicina je hluboka ${Math.floor(Math.random() * (30 - 1) + 1)} cm` });
	},
};