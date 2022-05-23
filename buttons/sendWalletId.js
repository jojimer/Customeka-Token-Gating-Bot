const { MessageActionRow, MessageButton } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const findRole = (cache,roleId) => { return cache.find(r => r.id === roleId); }; 

module.exports = {
    name: 'sendWalletId',
    data: new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('submitWalletId')
                .setLabel('Submit')
                .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                .setCustomId('cancelSubmit')
                .setLabel('Cancel')
                .setStyle('DANGER')
            ),
    submit: {
        async execute(interaction) {            
            await interaction.reply({
                content: 'Your data is processing please wait!',
                ephemeral: true,
                components: []
            });

            await wait(1000 * 10);

            const VIProleId = "973480269082406952";

            interaction.member.roles.add(
                findRole(interaction.guild.roles.cache,VIProleId)
            );
            //console.log(interaction.memberPermissions,interaction.member.roles);

            await interaction.editReply({content: 'You successfully sent your walletID!'});
        }
    },
    cancel: {
        async execute(interaction) {
            return;
            // await interaction.reply({
            //     content: 'You cancel submitting walletID!',
            //     ephemeral: true,
            //     components: []
            // })
        }
    },
}