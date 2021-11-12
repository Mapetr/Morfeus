const { SlashCommandBuilder } = require('@discordjs/builders');
const { redis } = require('../index');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('waifu')
		.setDescription('Get the waifu you always wanted. (Randomly selected)'),
	async execute(interaction) {
		if (interaction.channel.id != '908057134003011594') {
			await interaction.reply({ content: 'Wrong channel', ephemeral: true });
			return;
		}
		const filter = (reaction, user) => {
			return ['💖', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id;
		};
		const randNum = Math.floor(Math.random() * (15425 - 1) + 1).toString();
		const waifu = JSON.parse(await redis.get(randNum));
		const embed = new MessageEmbed()
			.setColor('#dcca00')
			.setTitle(waifu.name.toString())
			.setDescription(waifu.series.name.toString())
			.setImage(`https://cdn.mapetr.cz/${waifu.display_picture}`);
		const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
		await msg.react('💖').catch(err => console.error(err));
		await msg.react('❌').catch(err => console.error(err));
		msg.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '💖') {
					let json = JSON.parse(await redis.get(interaction.user.id.toString()));
					if (json == null) {
						json = { waifus: [] };
					}
					json.waifus.push(waifu.name.toString());
					await redis.set(interaction.user.id.toString(), JSON.stringify(json)).catch(err => console.error(err));
					msg.channel.send(`${interaction.user.username} and ${waifu.name.toString()} are now married!`);
					await interaction.deleteReply().catch(err => console.error(err));
				}
				else {
					await msg.channel.send('Removed.');
					await interaction.deleteReply().catch(err => console.error(err));
				}
			});
	},
};