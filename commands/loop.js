const data = require('../index').constructor;

module.exports = {
	name: 'loop',
    description: 'Loops the song!',
    cooldown: 1,
    aliases: [],
	execute(message, args) {
        data.loopSong = !data.loopSong;
        if (data.loopSong) {
            message.reply(`Looping the song!`).then(msg => { msg.delete({ timeout: 15000 }) });
        } else {
            message.reply(`Stopped looping the song`).then(msg => { msg.delete({ timeout: 15000 }) });
        }
	},
};