const { MessageActionRow, Modal, TextInputComponent, MessageEmbed } = require('discord.js');
const { validateWalletID, processWallet } = require(appRoot+'/hedera/process');
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
            .setRequired(true)
        )
    ),

    async execute(interaction) {
        // Get Wallet ID
        const walletID = interaction.fields.getTextInputValue('walletID');
        let walletValidity = false;
        let content = "Please wait while we process your WalletID: ";

        const newEmbed = new MessageEmbed()
        .setColor('RANDOM').setTitle(content)
        .setDescription(walletID).setFooter({text: "| 0%", iconURL: icon.loading});

        // Process Initial Bot Reply
        await interaction.reply({
            embeds: [newEmbed],
            ephemeral: true
        });        

        // Collect User Data
        const user = interaction.user;
        const userData = {id: user.id, username: user.username, vip: false, walletID: walletID };

        // Check if WalletID is valid
        await validateWalletID(walletID,interaction,newEmbed,(async result => {
            if(result) {

                // 0.0577399 wallet ID with empty doodle

                await wait(500);
                // Submit Data to firebase
                //await addUser(fireBaseDB,userData);

                await wait(500);
                // Search NFTs and Badges
                await processWallet(walletID,interaction,newEmbed);
            }
        }));
    }
}