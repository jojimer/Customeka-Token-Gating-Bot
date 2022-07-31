const { data } = require('../interactions/buttons/connectWalletId');
const { snapShotRoleClaimers } = require(appRoot+'/db_management/snapshots');
const { startMonitoring } = require(appRoot+'/db_management/new_monitor');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// Channel ID
		const nftData =  client.nft.get('data');
		const channels = nftData.channels;
		const connectChannel = channels.connect;
		const announcementChannel = channels.announcement;
		const projectDirectory = 'NFT_PROJECTS/'+nftData.directory+'/';

		// Check if guild is pause from receiving services 
		if(!nftData.projectIsPause) {
			// Send Bot Initial Message if channel is new
			client.channels.cache.get(connectChannel).messages.fetch({ limit: 1 }).then(message => {
				
				if(!message.first()) {
					data.pinned.setImage(nftData.connect_image);						
					client.channels.cache.get(connectChannel).send({content: nftData.greetings, embeds: [data.pinned], components: [data.button]});
				}
			})					

			// Add listener to members database for claiming roles after verification process completed
			snapShotRoleClaimers(client,announcementChannel,projectDirectory,nftData);
			// Monitor Verified Users
			//startMonitoring(client);
		}
	},
};