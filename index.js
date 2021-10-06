const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

module.exports.server = Map();

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	if (interaction.user.bot) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		const peepoThink = interaction.client.emojis.cache.find(emoji => emoji.name === 'peepoThink');
		await interaction.reply({ content: `Processing ${peepoThink}`, ephemeral: false });
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
	}
});

client.once('ready', c => {
	console.log(`Ready! as ${c.user.tag}`);
	c.user.setActivity('/play', { type: 'WATCHING' });
});

client.login(process.env.TOKEN);
