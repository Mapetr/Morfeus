const data = require('../index').constructor;

module.exports = {
	name: 'stop',
    description: 'Stop the music!',
    cooldown: 1,
    aliases: [],
	execute(message, args) {
        if (data.isPlaying) {
            data.dispatcher.end();
            data.voiceChannel.leave();
            data.queue = [];
            data.isPlaying = false;
            data.nowPlaying = null;
            data.dispatcher = null;
            data.loopSong = false;
            data.loopQueue = false;
            message.channel.send(`Stopped!`).then(msg => { msg.delete({ timeout: 15000 }) });
        }
	},
};