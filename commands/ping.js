module.exports = {
	name: 'ping',
    description: 'Ping!',
    cooldown: 1,
    aliases: ['test'],
	execute(message, args) {
		message.channel.send('Pong.');
	},
};