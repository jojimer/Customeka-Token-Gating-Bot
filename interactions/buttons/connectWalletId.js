const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'connectWalletId',
    data: {
        pinned: new MessageEmbed()
        .setColor('GREEN')
        .setDescription('Click button to connect!')
        .setImage('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREeGkthS-wMCASLF1TtH1rR8jueTwLRojuDw&usqp=CAU'),
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