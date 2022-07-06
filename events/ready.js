const { data } = require('../interactions/buttons/connectWalletId');
const { updateUserAccount } = require(appRoot+'/db_management/control');
const { onSnapshot, collection, query, orderBy, where } = require('firebase/firestore');

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

			const colRef = collection(fireBaseDB, projectDirectory+'members');

			//queries
			const q = query(colRef, where("verified", "==", "claiming"),orderBy('verification_time'));

			// realtime collection data
			onSnapshot(q, (snapshot) => {
				let users = []
				snapshot.docs.forEach(doc => {
					users.push({ ...doc.data(), id: doc.id })
				})

				users.map(async u => {
					
					let content = `“<@${u.id}> ${nftData.welcome}`;
					let role,roleObj;

					const guild = client.guilds.cache.get(nftData.guild_id);
					guild.members.search({query: u.username, limit: 15, cache: false}).then(r => {
						r.map(async gm => {
							if(gm.user.id === u.id){
								await u.roles.map(r => {
									role = `<@&${r.role_id}> `;
									content += role;
									roleObj = guild.roles.cache.get(r.role_id);
									gm.roles.add(roleObj);
								})

								client.channels.cache.get(announcementChannel).send({content: content});
								updateUserAccount(fireBaseDB,u.id,{verified:"claimed"},projectDirectory);
							}
						})
					})																				
				})
			}) // End of snapshot
		}
	},
};