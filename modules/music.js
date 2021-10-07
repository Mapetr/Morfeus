const ytdl = require('ytdl-core-discord');
// eslint-disable-next-line no-unused-vars
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');
const wait = require('util').promisify(setTimeout);
const { server } = require('../index.js');

module.exports = {
	play: play,
	stop: stop,
};

async function play(interaction) {
	const user = await interaction.member;
	const url = interaction.options.getString('url');
	const construct = server.get(user.guild.id);
	if (user.voice.channelId == null) {
		await interaction.editReply({ content: 'Connect to a voice channel!' });
		await wait(15000);
		await interaction.deleteReply();
		return;
	}
	if (!ytdl.validateURL(url)) {
		await interaction.editReply({ content: 'Wrong URL' });
		await wait(15000);
		await interaction.deleteReply();
		return;
	}
	if (construct.connector.player != null) {
		addQueue(interaction, construct, url);
		return;
	}
	connect(user, construct);
	start(url, interaction, construct);
}

function stop(interaction) {
	destroy(interaction, server.get(interaction.member.guild.id));
	interaction.editReply({ content: 'Stopped playing!' });
}

async function connect(user, construct) {
	const connection = joinVoiceChannel({
		channelId: user.voice.channelId,
		guildId: user.guild.id,
		adapterCreator: user.guild.voiceAdapterCreator,
	});
	const player = createAudioPlayer({
		behaviors: {
			noSubscriber: NoSubscriberBehavior.Stop,
		},
	});
	construct.connector = {
		connection: connection,
		player: player,
		resource: null,
	};
}

async function start(url, interaction, construct) {
	const info = await ytdl.getBasicInfo(url);
	construct.connector.resource = createAudioResource(await ytdl(url, { highWaterMark: 1 << 25, filter: 'audioonly' }));
	construct.connector.connection.subscribe(construct.connector.player);
	construct.connector.player.play(construct.connector.resource);
	interaction.client.user.setActivity(`/play | ${info.videoDetails.title}`, { type: 'LISTENING' });
	await interaction.editReply({ content: `Currently playing: ${info.videoDetails}` });
	await wait(25000);
	await interaction.deleteReply();
}

async function destroy(interaction, construct) {
	const connector = construct.connector;
	connector.player.stop();
	connector.connection.destroy();
	construct.delete(interaction.member.guild.id);
	interaction.client.user.setActivity('/play', { type: 'WATCHING' });
}

async function addQueue(interaction, construct, url) {
	const info = await ytdl.getBasicInfo(url);
	construct.songs = {
		nowPlaying: info.videoDetails.title,
		songs: [],
	};
	construct.songs.songs.push(url);
}