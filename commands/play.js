const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('discord-ytdl-core');
const ytdlcore = require('ytdl-core');
const {
	joinVoiceChannel,	createAudioPlayer, NoSubscriberBehavior,
	createAudioResource,
	AudioPlayerStatus,
} = require('@discordjs/voice');
const wait = require('util').promisify(setTimeout);
const { server } = require('../index');
const utils = require('../utils');

let player;
let sentry;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song!')
		.addStringOption((option) => option.setName('url')
			.setDescription('URL of the song')
			.setRequired(true)),
	async execute(interaction, sentryu, transaction) {
		sentry = sentryu;
		if (await utils(interaction.guildId, interaction.member.id)) {
			await interaction.deleteReply();
			transaction.finish();
		}
		const url = interaction.options.getString('url');
		if (!ytdlcore.validateURL(url)) return interaction.reply({ content: 'Not a valid url', ephemeral: true });
		if (!interaction.member.voice.channel) return interaction.reply({ content: 'You\'re not in a voice channel', ephemeral: true });
		const info = await ytdlcore.getInfo(url);
		if (server.has(interaction.guildId)) {
			const temp = server.get(interaction.guildId);
			if (interaction.member.voice.channel.id !== temp.voice) return interaction.reply({ content: 'You\'re not in the same voice channel', ephemeral: true });
			temp.queue.push(url);
			await interaction.reply({ content: `${info.videoDetails.title} has been added to queue` });
			await wait(20000);
			return interaction.deleteReply();
		}
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
		let temp = server.get(interaction.guildId);
		temp = {
			voice: interaction.member.voice.channel.id,
			queue: [],
			loop: false,
		};
		server.set(interaction.guildId, temp);
		this.play(url, interaction, info, connection);
		transaction.finish();
		return false;
	},
	async play(url, interaction, info, connection) {
		const stream = await ytdl(url, {
			filter: 'audioonly',
			fmt: 'mp3',
			// eslint-disable-next-line no-bitwise
			highWaterMark: 1 << 25,
		})
			.on('error', (err) => {
				console.error(err);
				sentry.captureException(err);
			});
		player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Stop,
			},
		});
		const resource = createAudioResource(stream);
		await player.play(resource);
		await connection.subscribe(player);
		player.on('error', (err) => {
			console.error(err);
			sentry.captureException(err);
			connection.destroy();
		});
		player.on(AudioPlayerStatus.Idle, async () => {
			const temp = server.get(interaction.guildId);
			if (temp === undefined) {
				player.stop();
			}
			if (temp.loop) {
				this.play(url, interaction, await ytdlcore.getInfo(temp.queue[0]), connection);
				return;
			}
			if (temp.queue.length >= 1) {
				this.play(temp.queue[0], interaction, await ytdlcore.getInfo(temp.queue[0]), connection);
				temp.queue.shift();
				return;
			}
			server.delete(interaction.guildId);
			connection.destroy();
		});
		if (!interaction.replied) {
			interaction.reply({ content: `Started playing: ${info.videoDetails.title}` });
			await wait(20000);
			await interaction.deleteReply();
		}
		else {
			const msg = await interaction.channel.send(`Started playing: ${info.videoDetails.title}`);
			await wait(20000);
			await msg.delete();
		}
	},
	skip() {
		player.stop();
	},
};
