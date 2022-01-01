const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { createClient } = require('redis');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const commands = [];
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const redis = createClient();
redis.on('error', (err) => console.error(err));
redis.connect();
module.exports.redis = redis;

module.exports.server = new Map();

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	}
	catch (error) {
		console.error(error);
	}
})();

client.on('interactionCreate', async interaction => {
	try {
		if (!interaction.isCommand()) return;
		if (interaction.user.bot) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
		}
	}
	catch (err) {
		console.error(err);
	}
});

client.once('ready', c => {
	console.log(`Ready! as ${c.user.tag}`);
	c.user.setActivity('/play', { type: 'WATCHING' });
});

client.login(process.env.TOKEN);
