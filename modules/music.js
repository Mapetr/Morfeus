const ytdl = require('ytdl-core-discord');
// eslint-disable-next-line no-unused-vars
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');

async function play(user, url, client) {
	connect(user);
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
	
}
