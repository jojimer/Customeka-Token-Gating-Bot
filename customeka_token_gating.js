// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');
const { loadCommands, loadButtons, loadModals, loadEvents, loadProjectAsset } = require('./loader');
const path = require('node:path');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
require('dotenv').config();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const { Init } = require('./db_management/init');

// Firestore Directive
const projects = require('./hedera/test_projects.json');

// Firebase Config
initializeApp(firebaseConfig);

// Firestore Init Services
global.fireBaseDB = getFirestore();

// Set Global Root
global.appRoot = path.resolve(__dirname);
global.localDB = "/local_database/verified_members/";

global.icon = {
	loading: "https://firebasestorage.googleapis.com/v0/b/discordbot-db-40708.appspot.com/o/spiral_loading.gif?alt=media&token=824a63c3-a4c7-43d7-8a38-83913c590a60",
	success: "https://firebasestorage.googleapis.com/v0/b/discordbot-db-40708.appspot.com/o/c.png?alt=media&token=924d41ba-b687-47ed-9f0f-be0036b70900",
	error: "https://firebasestorage.googleapis.com/v0/b/discordbot-db-40708.appspot.com/o/x.png?alt=media&token=7a2c0bbf-3df6-49f4-9852-b2fc8ef3fb09"
}

// Check if project is not pause and Login to Discord with your client's token
Object.keys(projects).map(p => {
	if(p !== "root"){
		const nftData = projects[`${p}`];
		Init(nftData.directory).then(initData => {
			if(!initData.pause){
				// Create a new client instance
				const client = new Client({
					intents: [
						Intents.FLAGS.GUILDS,
						Intents.FLAGS.GUILD_MESSAGES,
					],
				});

				const nft = {
					'directory': nftData.directory,
					'welcome': initData.announcement_message,
					'channels':initData.channels,
					'projectIsPause': initData.pause,
					'guild_id': initData.guild_id,
					'greetings': initData.greetings.replace("<nn>", "\n\n"),
					'name': nftData.name,
					'connect_image': initData.connect_image
				}
				
				// Load Project Assets
				client.nft = loadProjectAsset(new Collection(),nftData.name);
				client.nft.set('data',nft);
				//console.log(client.nft)
	
				// Load Interactions
				// client.commands = loadCommands(new Collection());
				client.buttons = loadButtons(new Collection());
				client.modals = loadModals(new Collection());
	
	
				// Client Event
				loadEvents(client);
	
				// Login with Toke ID
				client.login(process.env[nftData.env]);
			}
		})
	}
})