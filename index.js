// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');
const { loadCommands, loadButtons, loadModals, loadEvents } = require('./loader');
const path = require('node:path');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
require('dotenv').config();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

// Firebase Config
initializeApp(firebaseConfig);

// Firestore Init Services
global.fireBaseDB = getFirestore();

// Set Global Root
global.appRoot = path.resolve(__dirname);

global.icon = {
	loading: "https://firebasestorage.googleapis.com/v0/b/discordbot-db-40708.appspot.com/o/spiral_loading.gif?alt=media&token=824a63c3-a4c7-43d7-8a38-83913c590a60",
	success: "https://firebasestorage.googleapis.com/v0/b/discordbot-db-40708.appspot.com/o/c.png?alt=media&token=924d41ba-b687-47ed-9f0f-be0036b70900",
	error: "https://firebasestorage.googleapis.com/v0/b/discordbot-db-40708.appspot.com/o/x.png?alt=media&token=7a2c0bbf-3df6-49f4-9852-b2fc8ef3fb09"
}

// Collection Holder Ref
//const holder = collection(db, 'holder');

// #Delete Doc
// const docRef = doc(db, 'holder', 'xyvVpblG6X6wHlLrGgSS');
// deleteDoc(docRef);

// #Queries
// const q = query(holders, where("id", "==", "<discordID>"), orderBy("username", "desc"));

// // #List Collection
// // #onSnapshot will list new data when collection change
// // #getDocs will list data once
// onSnapshot(q, (snapshot) => {
// 	let userData =  [];
// 	snapshot.docs.forEach((doc) => {
// 		userData.push({ ...doc.data(), id: doc.id });
// 	});
// 	console.log(userData);
// })

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
	] });

// Load Commands
client.commands = loadCommands(new Collection());
client.buttons = loadButtons(new Collection());
client.modals = loadModals(new Collection());

// Client Event
loadEvents(client);

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
