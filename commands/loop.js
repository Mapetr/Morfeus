const data = require('../index').constructor;

module.exports = {
	name: 'loop',
    description: 'Loops the song!',
    cooldown: 1,
    aliases: [],
	execute(message, args) {
        if (!data.loopSong) {
            data.loopSong = true;
            message.reply(`Looping the song!`).then(msg => { msg.delete({ timeout: 15000 }) });
        } else {
            data.loopSong = false;
            message.reply(`Stopped looping the song`).then(msg => { msg.delete({ timeout: 15000 }) });
        }
	},
};