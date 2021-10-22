/* eslint-disable prefer-const */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const wait = require('util').promisify(setTimeout);
// const { queue, player, connection } = require('../helper.js');

let queue = [];
let playing = 0;
let player = null;
let connection = null;
let currentChannelId = 0;

module.exports.queue = queue;
module.exports.playing = playing;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays music')
		.addStringOption(option => option.setName('url').setDescription('Enter a url').setRequired(true)),
	async execute(interaction) {
		let url = interaction.options.getString('url');
		let user = await interaction.member;
		let info = await ytdl.getInfo(url);
		if (user.voice.channelId == null) {
			await interaction.editReply({ content: 'Connect to a voice channel first' });
			await wait(10000);
			await interaction.deleteReply();
			return;
		}
		if (!ytdl.validateURL(url)) {
			await interaction.editReply({ content: 'Wrong URL' });
			await wait(10000);
			await interaction.deleteReply();
			return;
		}
		if (playing == 1) {
			queue.push(url);
			await interaction.editReply({ content: `Added to queue ${info.videoDetails.title}` });
			await wait(10000);
			await interaction.deleteReply();
			return;
		}
		connection = joinVoiceChannel({
			channelId: user.voice.channelId,
			guildId: user.guild.id,
			adapterCreator: user.guild.voiceAdapterCreator,
		});
		player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Stop,
			},
		});
		currentChannelId = user.voice.channelId;
		let resource = createAudioResource(await ytdl(url, { highWaterMark: 1 << 30, filter: 'audioonly' }));
		connection.subscribe(player);
		player.play(resource);
		playing = 1;
		module.exports.player = player;
		module.exports.connection = connection;
		interaction.client.user.setActivity(`/play | ${info.videoDetails.title}`, { type: 'LISTENING' });
		await interaction.editReply({ content: `Currently playing: ${info.videoDetails.title}` });
		await wait(25000);
		await interaction.deleteReply();
		player.on(AudioPlayerStatus.Idle, async () => {
			if (queue.length != 0) {
				await wait(5000);
				info = await ytdl.getInfo(queue[0]);
				resource = createAudioResource(await ytdl(queue[0], { highWaterMark: 1 << 30, filter: 'audioonly' }));
				player.play(resource);
				queue.shift();
				interaction.client.user.setActivity(`/play | ${info.videoDetails.title}`, { type: 'LISTENING' });
				return;
			}
			this.destroy(interaction);
		});

		player.on('error', error => {
			console.error(error);
		});
	},
	destroy(interaction) {
		player.stop();
		connection.destroy();
		player = null;
		connection = null;
		playing = 0;
		currentChannelId = 0;
		interaction.client.user.setActivity('/play', { type: 'WATCHING' });
	},
	isConnected(interaction) {
		if (connection == null || connection == undefined) {
			return false;
		}
		if (interaction.member.voice.channelId == currentChannelId) {
			return true;
		}
		return false;
	},
	getQueue() {
		return queue;
	},
};