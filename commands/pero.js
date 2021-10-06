const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionResponseType } = require('discord-api-types');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pero')
		.setDescription('Measure your pp size'),
    async execute(interaction) {
		interaction.editReply({ content: `Tvoje pero je dlouhy ${Math.floor(Math.random() * (30 - 1) + 1)} cm` });
	},
};