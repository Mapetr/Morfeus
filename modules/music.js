const ytdl = require('ytdl-core-discord');
// eslint-disable-next-line no-unused-vars
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');
const { server } = require('../index.js');
const { connection } = require('../commands/play.js');

async function play(interaction, client) {
	const user = await interaction.member;
	const url = interaction.options.getString('url');
	const construct = server.get(user.guild.id);
	connect(user, construct);
	start(url, interaction, construct);
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
	const resource = createAudioResource(await ytdl(url, { highWaterMark: 1 << 25, filter: 'audioonly' }));
	connection.subscribe(construct.connector.player);
	construct.connector.player.play(resource);
}