const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'connectWalletId',
    data: {
        pinned: new MessageEmbed()
        .setColor('GREEN')
        .setDescription('Click button to connect!')
        .setImage('https://firebasestorage.googleapis.com/v0/b/discordbot-db-40708.appspot.com/o/connect.png?alt=media&token=48907f7b-04ec-4049-9189-d33e39071f71'),
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