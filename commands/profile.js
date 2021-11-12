const { SlashCommandBuilder } = require('@discordjs/builders');
const { redis } = require('../index');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Shows your waifus you own'),
	async execute(interaction) {
		const waifus = await redis.get(interaction.user.id.toString());
		if (waifus == null) {
			interaction.reply({ content: 'You don\'t have any waifus', ephemeral: true });
		}
		let string;
		for (let i = 0;i < waifus.length; i++) {
			string = `${string}\n${waifus.waifus[i]}`;
		}
		const embed = new MessageEmbed()
			.setTitle(`${interaction.user.username.toString()}'s waifus`)
			.setDescription(string.toString());
		interaction.reply({ embeds: embed });
	},
};