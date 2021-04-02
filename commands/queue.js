const data = require('../index').constructor;

module.exports = {
	name: 'queue',
    description: 'Display the queue!',
    cooldown: 1,
    aliases: [],
	execute(message, args) {
		if (data.queue === []) {
			message.reply(data.queue).then(msg => { msg.delete({ timeout: 15000 }) });
		} else {
			message.reply(`The queue is empty!`).then(msg => { msg.delete({ timeout: 15000 }) });
		}
	},
};