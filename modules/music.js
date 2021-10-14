const ytdl = require('ytdl-core-discord');
// eslint-disable-next-line no-unused-vars
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');
const wait = require('util').promisify(setTimeout);
const { server } = require('../index.js');

module.exports = {
	play: play,
	stop: stop,
	skip: skip,
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
	const title = start(url, interaction, construct);
	await interaction.editReply({ content: `Currently playing: ${title}` });
	await wait(25000);
	await interaction.deleteReply();
	construct.connector.player.on(AudioPlayerStatus.Idle, async () => {
		const queue = construct.queue;
		if (queue.length != 0) {
			await wait(5000);
			start(queue[0].url, interaction, construct);
			return;
		}
		destroy(interaction, construct);
	});
	construct.connector.player.on('error', error => {
		console.error(error);
	});
}

async function stop(interaction) {
	destroy(interaction, server.get(interaction.member.guild.id));
	await interaction.editReply({ content: 'Stopped playing!' });
	await wait(25000);
	await interaction.deleteReply();
}

async function skip(interaction) {
	server.get(server.get(interaction.member.guild.id).queue);
	await interaction.editReply({ content: 'Skipped!' });
	await wait(25000);
	await interaction.deleteReply();
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
	construct.songs = {
		nowPlaying: '',
		songs: [],
	};
}

async function start(interaction, url, construct) {
	const info = await ytdl.getBasicInfo(url);
	construct.connector.resource = createAudioResource(await ytdl(url, { highWaterMark: 1024 * 1024 * 10, filter: 'audioonly' }));
	construct.connector.connection.subscribe(construct.connector.player);
	construct.connector.player.play(construct.connector.resource);
	interaction.client.user.setActivity(`/play | ${info.videoDetails.title}`, { type: 'LISTENING' });
	return info.videoDetails.title;
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
	const queue = {
		url: url,
		title: info.videoDetails.title,
	};
	construct.queue.push(queue);
	await interaction.editReply({ content: `Added to queue ${info.videoDetails.title}` });
	await wait(10000);
	await interaction.deleteReply();
}

async function skip(interaction) {
	const construct = server.get(interaction.member.guild.id);
	const songs = construct.songs.songs;
	if (songs.length > 0) {
		const url = songs.shift();
		start(interaction, url, construct);
	}
}