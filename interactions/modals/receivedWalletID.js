const { MessageActionRow, Modal, TextInputComponent, MessageEmbed } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

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
        // Get Process
        // const project = interaction.client.nft.name;
        const projectDirectory = 'NFT_PROJECTS/'+interaction.client.nft.get('directory')+'/';
        const { validateWalletID, processWallet } = interaction.client.nft.get('process');

        // Get Wallet ID
        const walletID = interaction.fields.getTextInputValue('walletID');
        let content = "Please wait while we process your Wallet ID: ";

        const newEmbed = new MessageEmbed()
        .setColor('RANDOM').setTitle(content)
        .setDescription(walletID).setFooter({text: "| 0%", iconURL: icon.loading});

        // Process Initial Bot Reply
        await interaction.reply({
            embeds: [newEmbed],
            ephemeral: true
        });

        // Check if WalletID is valid
        await validateWalletID(walletID,interaction,newEmbed,projectDirectory,(async result => {
            if(result) {

                // 0.0577399 wallet ID with empty doodle
                await wait(500);
                // Search NFTs and Badges
                await processWallet(walletID,interaction,newEmbed,projectDirectory);
            }
        }));
    }
}