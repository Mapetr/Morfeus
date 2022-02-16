const { SlashCommandBuilder } = require('@discordjs/builders');
const { createClient } = require('redis');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('banmusic')
		.setDescription('Bans someone from using music commands!')
		.addMentionableOption((option) => option.setName('mentionable').setDescription('User to ban').setRequired(true)),
	async execute(interaction, sentry, transaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
			interaction.reply({ content: 'No', ephemeral: true });
			transaction.finish();
			return;
		}
		const member = interaction.options.getMentionable('mentionable');
		const client = createClient();
		client.on('error', (err) => {
			console.error(err);
			sentry.captureException(err);
		});
		await client.connect();
		let json = await client.get(interaction.guildId);
		if (json === null) {
			json = {
				blocked: [],
			};
		}
		else {
			json = JSON.parse(json);
		}
		if (!json.blocked.includes(member.id)) {
			json.blocked.push(member.id);
			await client.set(interaction.guildId, JSON.stringify(json));
			interaction.reply('User has been added');
		}
		else {
			interaction.reply('User has been already added');
		}

		transaction.finish();
	},
};
