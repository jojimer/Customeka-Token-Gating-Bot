const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'connectWalletId',
    data: {
        pinned: new MessageEmbed()
        .setColor('GREEN')
        .setDescription('Click button to connect!'),
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