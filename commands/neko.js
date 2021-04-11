const client = require('nekos.life');
const neko = new client();

module.exports = {
	name: 'neko',
    description: 'Sends a neko!',
    cooldown: 3,
    aliases: [],
	async execute(message, args) {
        if (message.channel.nsfw) {
            message.channel.send({ files: [`${await (await neko.nsfw.neko()).url}`] });
        } else {
            message.reply(`This command only works in NSFW channels!`).then(msg => { msg.delete({ timeout: 15000 })});
        }
	},
};