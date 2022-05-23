const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Connect walletID to get access to user verified channels and VIP channels.')
		.addStringOption(option =>
			option.setName('input_wallet_id')
				.setDescription('Submit your walletID and gain access to user verified channels and VIP channels.')
				.setRequired(true)
		),
	async execute(interaction) {
		const walletID = interaction.options.getString('input_wallet_id');
		const buttons = interaction.client.buttons.get('sendWalletId').data;
		const embedReply = new MessageEmbed()
							.setColor('GREEN')
							.setDescription('Confirm wallet_ID?')
							.addField('Your wallet_ID',walletID)
							.setFooter('The message confirmation will expires in 15 seconds!');

		await interaction.reply(
			{ embeds: [embedReply],
			  ephemeral: true,
			  components: [buttons],
			});

		const filter = i => i.user.id === interaction.user.id;

		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
		
		collector.on('collect', async i => {			
			if (i.customId === 'submitWalletId') {
				await interaction.editReply({ content: 'You clicked submit!', components: [], embeds: [] });
			}else{
				await interaction.editReply({ content: 'You clicked cancel!', components: [], embeds: [] });
			}
		});

		collector.on('end',(collection) => {
			if(!collection.size)
			interaction.editReply({ content: 'The message confirmation action expired!', components: [], embeds: [] });
			console.log(`Collected ${collection.size} items`);
		});
		
		
	},
};