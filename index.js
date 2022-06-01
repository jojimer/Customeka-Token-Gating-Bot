// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');
const { loadCommands, loadButtons, loadModals, loadEvents } = require('./loader');
const path = require('node:path');
const { firebaseConfig } = require('./firebase');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { collection, getDocs, getDoc, deleteDoc, doc, onSnapshot, query, where, orderBy } = require('firebase/firestore');

require('dotenv').config();

// Firebase Config
initializeApp(firebaseConfig);

// Firestore Init Services
global.fireBaseDB = getFirestore();
		
// Set Global Root
global.appRoot = path.resolve(__dirname);

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
