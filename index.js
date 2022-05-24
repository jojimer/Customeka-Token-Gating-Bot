// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');
const { loadCommands, loadButtons, loadModals, loadEvents } = require('./loader');
const { firebaseConfig } = require('./firebase');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot } = require('firebase/firestore');

require('dotenv').config();

// Firebase Config
// initializeApp(firebaseConfig);

// // Firestore Init Services
// const db = getFirestore();

// // Collection Holder Ref
// const holder = collection(db, 'holder');

// #Add new doc
// addDoc(holder, {
// 	NFT: {
// 		serialNumber: '3',
// 		tokenID: '0.0.0.323568',
// 	},
// 	userID: "#dg3445235",
// 	vip: false,
// 	walletID: "0.0.0.354646" 
// });

// #Delete Doc
// const docRef = doc(db, 'holder', 'xyvVpblG6X6wHlLrGgSS');
// deleteDoc(docRef);


// #List Collection
// OnSnapshot will list new data when collection change
// getDocs will list data once
// onSnapshot(holder).then((snapshot) => {
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
