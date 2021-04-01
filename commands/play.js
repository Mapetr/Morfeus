const ytdl = require('ytdl-core-discord');
const data = require('../index').constructor;

function leave(voiceChannel) {
    data.isPlaying = false;
    if (data.skipped) {
        data.skipped = false;
        return;
    }
    console.log(data.queue);
    if (data.queue !== null && data.queue !== '[]' && data.queue !== undefined && data.queue !== []) {
        this.playSong(data.queue[0], voiceChannel);
        data.queue.splice(0, 1);
        data.nowPlaying = null;
        data.dispatcher = null;
        return;
    }
    data.queue = null;
    data.skipped = false;
    data.dispatcher = null;
    data.nowPlaying = null;
    data.loopSong = false;
    data.loopQueue = false;
    voiceChannel.leave();
}

module.exports = {
	name: 'play',
    description: 'Play a song!',
    cooldown: 1,
    aliases: [],
    async playSong(url, voiceChannel) {
        let dispatcher;
        if (!data.isPlaying) {
            try {
                const connection = await voiceChannel.join();
                data.isPlaying = true;
                data.nowPlaying = url;
                dispatcher = connection.play(await ytdl(url, { quality: 'highestaudio', highWaterMark: 1 << 25 }), { type: 'opus', highWaterMark: 25 });
                data.voiceChannel = voiceChannel;
                data.dispatcher = dispatcher;
            } catch (err) {
                console.log(err);
                leave(voiceChannel);
            }
        } else {
            if (data.queue == null) {
                data.queue = [];
            }
            data.queue.push(url);
            return;
        }
        dispatcher.on('start', () => {
            console.log('started playing');
        });
        
        dispatcher.on('finish', () => {
            console.log('finish playing');
            leave(voiceChannel);
        });

        dispatcher.on('error', console.error);
    },
    async execute(message, args) {
        if (args === []) {
            message.reply(`You have to give me a link to a youtube video!`);
            return;
        }
        const voiceChannel = message.member.voice.channel;
        if (voiceChannel) {
            const url = args[0];
            this.playSong(url, voiceChannel);
        } else {
            message.reply('Join a voice channel first!');
        }
	},
};