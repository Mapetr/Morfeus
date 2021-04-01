const data = require('../index').constructor;
const play = require('./play');

module.exports = {
	name: 'skip',
    description: 'Skips the song!',
    cooldown: 1,
    aliases: [],
    execute(message, args) {
		if (data.isPlaying) {
            data.isPlaying = false;
            data.skipped = true;
            data.dispatcher.end();
            if (data.queue !== null && data.queue !== undefined && data.queue !== '[]') {
                console.log('skip');
                play.playSong(data.queue[0], data.voiceChannel);
                data.queue.splice(0, 1);
            } else {
                console.log('leave');
                data.voiceChannel.leave();
                data.queue = null;
                data.isPlaying = false;
                data.nowPlaying = null;
                data.dispatcher = null;
                data.loopSong = false;
                data.loopQueue = false;
            }
        }
	},
};