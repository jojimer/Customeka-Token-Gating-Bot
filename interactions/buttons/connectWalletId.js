const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'connectWalletId',
    data: {
        pinned: new MessageEmbed()
        .setColor('GREEN')
        .setDescription('Click button to connect!')
        .setImage('https://firebasestorage.googleapis.com/v0/b/discordbot-db-40708.appspot.com/o/numbpad_2_50.jpeg?alt=media&token=45cc2d32-cffc-4ce8-8cb5-585f9c68b005'),
        button: new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('connectWalletId')
                .setLabel('Connect')
                .setStyle('SUCCESS')
            ),
    },
    async execute(interaction) {        
        const modal = interaction.client.modals.get('receivedWalletID').data;
        await interaction.showModal(modal);
    }
}