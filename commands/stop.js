const data = require('../index').constructor;

module.exports = {
	name: 'stop',
    description: 'Stop the music!',
    cooldown: 1,
    aliases: [],
	execute(message, args, client) {
        if (data.isPlaying) {
            data.dispatcher.end();
            data.voiceChannel.leave();
            data.queue = [];
            data.isPlaying = false;
            data.nowPlaying = null;
            data.dispatcher = null;
            data.loopSong = false;
            data.loopQueue = false;
            client.user.setActivity('!', { type: 'WATCHING' });
            message.channel.send(`Stopped!`).then(msg => { msg.delete({ timeout: 15000 }) });
        }
	},
};