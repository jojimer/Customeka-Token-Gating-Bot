const fs = require('node:fs');
const path = require('node:path');

// directory
const comm = 'interactions/commands';
const butt = 'interactions/buttons';
const mod = 'interactions/modals';

// Search Command Files
const commandPath = path.join(comm);
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

// Search Button Files
const buttonPath = path.join(butt);
const buttonFiles = fs.readdirSync(buttonPath).filter(file => file.endsWith('.js'));

// Search Modal Files
const modalPath = path.join(mod);
const modalFiles = fs.readdirSync(modalPath).filter(file => file.endsWith('.js'));

// Search Event Files
const eventsPath = path.join('events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));


module.exports = {
    loadCommands: (collection) => {       

        for (const file of commandFiles) {
            const command = require(`./${comm}/${file}`);
            // Set a new item in the Collection
            // With the key as the command name and the value as the exported module
            collection.set(command.data.name, command);
        }

        return collection;
    },
    loadButtons: (collection) => {

        for (const file of buttonFiles) {
            const button = require(`./${butt}/${file}`);
            // Set a new item in the Collection
            // With the key as the button customId and the value as the exported module
            collection.set(button.name, button);
        }

        return collection;
    },
    loadModals: (collection) => {

        for (const file of modalFiles) {
            const modal = require(`./${mod}/${file}`);
            // Set a new item in the Collection
            // With the key as the modal customId and the value as the exported module
            collection.set(modal.data.customId, modal);
        }

        return collection;
    },
    loadEvents: (client) => {        

        for (const file of eventFiles) {
            const event = require(`./events/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
}