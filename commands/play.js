const ytdl = require('ytdl-core-discord');
//const ytdlcore = require('ytdl-core');
const ytpl = require('ytpl');
const data = require('../index').constructor;

function leave(voiceChannel) {
    data.isPlaying = false;
    if (data.skipped) {
        data.skipped = false;
        return;
    }
    if (data.queue !== null && data.queue !== '[]' && data.queue !== undefined && data.queue !== []) {
        this.playSong(data.queue[0], voiceChannel);
        data.queue.splice(0, 1);
        data.nowPlaying = null;
        data.dispatcher = null;
        return;
    }
    data.queue = [];
    data.skipped = false;
    data.dispatcher = null;
    data.nowPlaying = null;
    data.loopSong = false;
    data.loopQueue = false;
    data.msgChannel = null;
    voiceChannel.leave();
}

module.exports = {
	name: 'play',
    description: 'Play a song!',
    cooldown: 1,
    aliases: ['youtube'],
    async playSong(url, voiceChannel) {
        let dispatcher;
        let info;
        try {
            const id = await ytpl.getPlaylistID(url).catch();
            if (await ytpl.validateID(id)) {
                const result = await (await ytpl(id)).items;
                data.isPlaylist = true;
                for (let index = 0; index < result.length; index++) {
                    this.playSong(result[index].shortUrl, voiceChannel);
                    await setTimeout(() => { }, 200);
                }
                data.isPlaylist = false;
                return;
            }
        } catch (err) {
        }
        if (!await ytdl.validateURL(url)) {
            data.msgChannel.reply(`Cannot get a video from the link`);
            return;
        }
        info = await ytdl.getBasicInfo(url);
        if (!data.isPlaying) {
            try {
                const connection = await voiceChannel.join();
                data.isPlaying = true;
                data.nowPlaying = url;
                if(data.isPlaylist === false) data.msgChannel.send(`Now playing: ${info.player_response.videoDetails.title}`).then(msg => { msg.delete({ timeout: parseInt(info.formats[0].approxDurationMs) })});
                dispatcher = connection.play(await ytdl(url, { quality: 'highestaudio', highWaterMark: 25 }), { type: 'opus', highWaterMark: 25 });
                data.voiceChannel = voiceChannel;
                data.dispatcher = dispatcher;
            } catch (err) {
                console.log(err);
                leave(voiceChannel);
                return;
            }
        } else {
            if (data.queue == null) {
                data.queue = [];
            }
            data.queue.push(url);
            if(data.isPlaylist === false) data.msgChannel.send(`Added to queue: ${info.player_response.videoDetails.title}`).then(msg => { msg.delete({ timeout: 15000 })});
            return;
        }
        dispatcher.on('start', async () => {
        });
        
        dispatcher.on('finish', () => {
            if (data.loopSong) {
                data.isPlaying = false;
                this.playSong(data.nowPlaying, voiceChannel);
            } else if (data.queue !== []) {
                data.isPlaying = false;
                this.playSong(data.queue[0], voiceChannel);
                data.queue.shift();
            } else {
                leave(voiceChannel);
            }
        });

        dispatcher.on('error', () => {
            console.error();
            data.dispatcher.end();
        });
    },
    async execute(message, args) {
        console.log(args);
        if (args == []) {
            message.reply(`You have to give me a link to a youtube video!`);
            return;
        }
        const voiceChannel = message.member.voice.channel;
        if (voiceChannel) {
            const url = args[0];
            data.msgChannel = message.channel;
            this.playSong(url, voiceChannel);
        } else {
            message.reply('Join a voice channel first!');
        }
	},
};