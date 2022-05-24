const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const findRole = (cache,roleId) => { return cache.find(r => r.id === roleId); };

module.exports = {
    data: new Modal()
    .setCustomId('receivedWalletID')
    .setTitle('Connect your walletID to your account!')
    .addComponents(
        new MessageActionRow()
        .addComponents(
            new TextInputComponent()
            .setCustomId('walletID')
            .setLabel('Your walletID')
            .setStyle('SHORT')
        )
    ),
    async execute(interaction) {
        await interaction.reply({
            content: 'Your data is processing please wait!',
            ephemeral: true
        });

        await wait(1000 * 5);

        const VIProleId = "973480269082406952";

        interaction.member.roles.add(
            findRole(interaction.guild.roles.cache,VIProleId)
        );
        //console.log(interaction.memberPermissions,interaction.member.roles);

        await interaction.editReply({content: 'You successfully sent your walletID!'});
    }
}