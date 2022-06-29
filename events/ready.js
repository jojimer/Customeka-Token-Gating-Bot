const { data } = require('../interactions/buttons/connectWalletId');
const init = require('../db_management/init');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		// Set New Name
		//client.user.setUsername("Serpent Bot");

		// Set New Avatar Icon
		//client.user.setAvatar("https://connect.customeka.xyz/images/serp_logo1.png");

		// Stop Connecting the guild
		init.validate(fireBaseDB).then(guilds => {
			// Map All Registered guild
			Object.keys(guilds).map(async id => {

				// Guild Object 
				const guild = guilds[`${id}`];

				// Channel ID
				const connectChannel = guild.channels.connect;

				// Check if guild is pause from receiving services 
				if(!guild.pause) {

					// Send Bot Initial Message if channel is new
					client.channels.cache.get(connectChannel).messages.fetch({ limit: 1 }).then(message => {
						if(!message.first()) {
							client.channels.cache.get(connectChannel).send({content: guild.greetings, embeds: [data.pinned], components: [data.button]});
						}
					})

				}
				
				// Check if channels is new from receiving services
				// if(!guild.new) return;

				//console.log(client.guilds.cache.get(id).memberCount)
			})			
		});
	},
};