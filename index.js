require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
  constructor() {
    this.data = {
      queue: [],
      isPlaying: false,
      nowPlaying: null,
      dispatcher: null,
      voiceChannel: null,
      loopSong: false,
      loopQueue: false,
      skipped: false,
    };
  },
};

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
}


client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;
    const args = message.content.slice(process.env.PREFIX.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();

    if (message.deletable) message.delete();

    if (!client.commands.has(commandName)) return;
    const command = client.commands.get(commandName)
       || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    const { cooldowns } = client;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        return;
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
	    command.execute(message, args);
    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.TOKEN);


