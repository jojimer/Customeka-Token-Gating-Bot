const { data } = require('../interactions/buttons/connectWalletId');
const init = require('../db_management/init');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// Stop Connecting the guild
		init.validate(fireBaseDB).then(guilds => {
			// Map All Registered guild
			Object.keys(guilds).map(id => {

				// Guild Object 
				const guild = guilds[`${id}`];

				// Channel ID
				const chID = guild.channel;

				// Check if guild is pause from receiving services
				if(!guilds[`${id}`].pause) {				

					// Send Bot Initial Message if channel is new
					client.channels.cache.get(chID).messages.fetch({ limit: 1 }).then(message => {
						if(!message.first()) {
							client.channels.cache.get(chID).send({content: 'Hello from DoodleBot', embeds: [data.pinned], components: [data.button]});
						}
					})

				}
				
				// Check if channels is new from receiving services
				if(!guild.new) return;

				//console.log(client.guilds.cache.get(id).memberCount)
				
			})			
		});

		// Continue with other services
	},
};