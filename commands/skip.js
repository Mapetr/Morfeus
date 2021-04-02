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
            console.log(`Skipped!`).then(msg => { msg.delete({ timeout: 10000 }) });
            if (data.queue !== null && data.queue !== undefined && data.queue !== '[]') {
                play.playSong(data.queue[0], data.voiceChannel);
                data.queue.splice(0, 1);
            } else {
                data.voiceChannel.leave();
                data.queue = [];
                data.isPlaying = false;
                data.nowPlaying = null;
                data.dispatcher = null;
                data.loopSong = false;
                data.loopQueue = false;
            }
        }
	},
};