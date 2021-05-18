const ytdl = require('ytdl-core-discord');
//const ytdlcore = require('ytdl-core');
const ytpl = require('ytpl');
const data = require('../index').constructor;

const bannedWords = ['cum', 'cuming', 'cumming', 'porn', 'moans', 'moan', 'moaning', 'hours', 'sex', 'scream', 'screams', 'screaming', 'earrape', 'nigger', 'nigga', 'negr', 'fuck', 'fucking', 'screams', 'scream'];

let client;

function leave(voiceChannel) {
    data.dispatcher.end();
    data.voiceChannel.leave();
    data.queue = [];
    data.isPlaying = false;
    data.nowPlaying = null;
    data.dispatcher = null;
    data.loopSong = false;
    data.loopQueue = false;
    client.user.setActivity('!', { type: 'WATCHING' });
}

module.exports = {
	name: 'play',
    description: 'Play a song!',
    cooldown: 1,
    aliases: ['youtube'],
    async playSong(url, voiceChannel) {
        let dispatcher;
        let info;
        const ytRegex = new RegExp('^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$');
        if (!ytRegex.test(url)) {
            data.msgChannel.send(`You didn't gave me a youtube url`).then(msg => { msg.delete({ timeout: 15000 }) });
            return;
        }
        const playlistRegex = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
        const match = url.match(playlistRegex);
        let playlistId;
        if (match && match[2]) {
            playlistId = match[2];
            if (data.queue == null) {
                data.queue = [];
            }
            const items = await (await ytpl(playlistId)).items;
            for (let index = 1; index < items.length; index++) {
                data.queue.push(items[index].shortUrl);
            }
            url = items[0].shortUrl;
        }
        info = await ytdl.getBasicInfo(url);
        for (let i = 0; i < bannedWords; i++) {
            if (info.player_response.videoDetails.title.toLowerCase().includes(bannedWords[i])) {
                leave(voiceChannel);
                return;
            }
        }
        if (!data.isPlaying) {
            try {
                const connection = await voiceChannel.join();
                data.isPlaying = true;
                data.nowPlaying = url;
                data.msgChannel.send(`Now playing: ${info.player_response.videoDetails.title}`).then(msg => { msg.delete({ timeout: parseInt(info.formats[0].approxDurationMs) })});
                dispatcher = connection.play(await ytdl(url, { quality: 'highestaudio', highWaterMark: 1 << 25 }), { type: 'opus', highWaterMark: 1 << 25, volume: false });
                client.user.setActivity(`${info.player_response.videoDetails.title} - ${info.player_response.videoDetails.author}`, { type: 'PLAYING' });
                data.voiceChannel = voiceChannel;
                data.dispatcher = dispatcher;
            } catch (err) {
                console.error(err);
                leave(voiceChannel);
                return;
            }
        } else {
            if (data.queue == null) {
                data.queue = [];
            }
            data.queue.push(url);
            data.msgChannel.send(`Added to queue: ${info.player_response.videoDetails.title}`).then(msg => { msg.delete({ timeout: 15000 })});
            return;
        }
        dispatcher.on('start', async () => {
        });

        dispatcher.on('finish', () => {
            data.isPlaying = false;
            if (data.loopSong === true) {
                data.dispatcher.end();
                this.playSong(data.nowPlaying, voiceChannel);
                return;
            }
            if (data.queue !== null && data.queue !== [] && data.queue !== undefined && data.queue !== null) {
                this.playSong(data.queue[0], voiceChannel);
                data.queue.shift();
                return;
            }
            leave();
        });

        dispatcher.on('error', () => {
            console.error();
            leave()
        });
    },
    async execute(message, args, globalClient) {
        if (args == []) {
            message.reply(`You have to give me a link to a youtube video!`);
            return;
        }
        if (message.author.id === '743722973604741181' || message.author.id === '804790994486820874') {
            return;
        }
        const voiceChannel = message.member.voice.channel;
        if (voiceChannel) {
            const url = args[0];
            client = globalClient;
            data.msgChannel = message.channel;
            this.playSong(url, voiceChannel);
        } else {
            message.reply('Join a voice channel first!');
        }
	},
};