const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'claimRoles',
    data: {
        claimBTN: new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel('Claim Roles')
                .setStyle('LINK')
            ),
    }
}