const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('discord-ytdl-core');
const ytdlcore = require('ytdl-core');
const {
	joinVoiceChannel,	createAudioPlayer, NoSubscriberBehavior,
	createAudioResource,
	StreamType,
} = require('@discordjs/voice');
//const server = require('../index');
const server = new Map();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song!')
		.addStringOption((option) => option.setName('url')
			.setDescription('URL of the song')
			.setRequired(true)),
	async execute(interaction, Sentry) {
		const url = interaction.options.getString('url');
		if (!ytdlcore.validateURL(url)) return interaction.reply('Not a valid url');
		if (!interaction.member.voice.channel) return interaction.reply('You\'re not in a voice channel');
		const info = await ytdlcore.getInfo(url);
		if (server.has(interaction.guildId)) {
			let temp = server.get(interaction.guildId);
			if (interaction.member.voice.guildId !== temp.voice) return interaction.reply('You\'re not in the same voice channel');
			temp.queue.push(url);
			return interaction.reply(`${info.videoDetails.title} has been added to queue`);
		}
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
		connection.subscribe(player);
		let temp = server.get(interaction.guildId);
		temp = {
			voice: interaction.member.voice.channelId,
			queue: [],
			loop: false,
		}
		server.set(interaction.guildId, temp);
		return false;
	},
	async play(url) {
		const stream = ytdl(url, {
			filter: 'audioonly',
			opusEncoded: false,
			fmt: 's16le',
			// eslint-disable-next-line no-bitwise
			highWaterMark: 1 << 25,
		})
			.on('error', (err) => {
				console.error(err);
				Sentry.captureException(err);
			});
		const player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Stop,
			},
		});
		const resource = createAudioResource(stream, {
			inputType: StreamType.Raw,
		});
		player.on('error', (err) => {
			console.error(err);
			Sentry.captureException(err);
			connection.destroy();
		});
		player.on('finish', () => {
			let temp = server.get(interaction.guildId);
			if (temp.loop) {

			}
			server.delete(interaction.guildId);
			connection.destroy();
		});
		interaction.reply(`Started playing: ${info.videoDetails.title}`);
		player.play(resource);
		return player;
	}
};
