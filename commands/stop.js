const data = require('../index').constructor;

module.exports = {
	name: 'stop',
    description: 'Stop the music!',
    cooldown: 1,
    aliases: [],
	execute(message, args) {
        if (data.isPlaying) {
            if (data.isSpotify) {
                data.isPlaying = false;
                data.page.close();
                data.page = null;
                data.voiceChannel.leave();
                data.voiceChannel = null;
                data.spotifyDispatcher.end();
                data.spotifyDispatcher = null;
                data.isSpotify = false;
            } else {
                data.dispatcher.end();
                data.voiceChannel.leave();
                data.queue = [];
                data.isPlaying = false;
                data.nowPlaying = null;
                data.dispatcher = null;
                data.loopSong = false;
                data.loopQueue = false;
            }
            message.channel.send(`Stopped!`).then(msg => { msg.delete({ timeout: 15000 }) });
        }
	},
};