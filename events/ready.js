const { data } = require('../interactions/buttons/connectWalletId');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.channels.cache.get('977630237523337236').send({content: 'Hello from DoodleBot', embeds: [data.pinned], components: [data.button]});
	},
};