const ytdl = require('ytdl-core-discord');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
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
	let construct = server.get(user.guild.id);
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
	if (construct != undefined) {
		addQueue(interaction, url);
		return;
	}
	connect(user);
	await start(interaction, url);
	construct = server.get(user.guild.id);
	construct.player.on(AudioPlayerStatus.Idle, async () => {
		const songs = construct.queue;
		console.log(songs);
		if (songs.length > 0) {
			await start(interaction, songs[0]);
			songs.shift();
		}
		await destroy(interaction);
	});
	construct.player.on('error', error => {
		console.error(error);
	});
}

async function stop(interaction) {
	await destroy(interaction, server.get(interaction.member.guild.id));
	await interaction.editReply({ content: 'Stopped playing!' });
	await wait(25000);
	await interaction.deleteReply();
}

async function connect(user) {
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
	const connector = {
		connection: connection,
		player: player,
		resource: null,
		queue: [],
	};
	server.set(user.guild.id, connector);
}

async function start(interaction, url) {
	const construct = server.get(interaction.member.guild.id);
	const info = await ytdl.getBasicInfo(url);
	construct.resource = createAudioResource(await ytdl(url, { highWaterMark: 1 << 25, filter: 'audioonly' }));
	construct.connection.subscribe(construct.player);
	construct.player.play(construct.resource);
	interaction.client.user.setActivity(`/play | ${info.videoDetails.title}`, { type: 'LISTENING' });
	await interaction.editReply({ content: `Currently playing: ${info.videoDetails.title}` });
	await wait(25000);
	await interaction.deleteReply();
}

async function destroy(interaction) {
	const construct = server.get(interaction.member.guild.id);
	construct.player.stop();
	construct.connection.destroy();
	construct.delete(interaction.member.guild.id);
	interaction.client.user.setActivity('/play', { type: 'WATCHING' });
}

async function addQueue(interaction, url) {
	const construct = server.get(interaction.member.guild.id);
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
	const songs = construct.queue;
	console.log(songs);
	if (songs.length > 0) {
		start(interaction, songs[0]);
		songs.shift();
		await interaction.editReply({ content: 'Skipped!' });
		await wait(25000);
		await interaction.deleteReply();
		return;
	}
	await interaction.editReply({ content: 'Theres nothing else in queue!' });
	await wait(25000);
	await interaction.deleteReply();
	destroy();
}