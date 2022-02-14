const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

// Sentry.io
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.5,
});

const rest = new REST().setToken(process.env.TOKEN);
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

const commands = [];
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

// eslint-disable-next-line no-restricted-syntax
for (const file of commandFiles) {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
        Sentry.captureException(error);
    }
})();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, Sentry);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        Sentry.captureException(error);
    }
});

client.once('ready', () => {
    console.log('Ready!');
});

client.on('guildCreate', async (guild) => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        Sentry.captureException(error);
    }
});

client.on('error', (err) => {
    Sentry.captureException(err);
});

client.login(process.env.TOKEN);

module.exports = new Map();
