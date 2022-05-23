// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');
const { loadCommands, loadButtons, loadEvents } = require('./loader');
const firebbaseConfig = require('./firebase');
const { initializeApp } = require('firebase/app');

require('dotenv').config();

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
	] });

// Load Commands
client.commands = loadCommands(new Collection());
client.buttons = loadButtons(new Collection());

// Client Event
loadEvents(client);

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
