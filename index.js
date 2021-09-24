const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { createCipheriv } = require('crypto');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Error! :Sadge:', ephemeral: true });
    }
})

client.once('ready', c => {
	console.log(`Ready! as ${c.user.tag}`);
});

client.login(process.env.TOKEN);
