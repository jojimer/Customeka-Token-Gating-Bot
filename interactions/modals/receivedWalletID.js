const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const { addUser } = require(appRoot+'/db_management/control');
const wait = require('node:timers/promises').setTimeout;
const findRole = (cache,roleId) => { return cache.find(r => r.id === roleId); };

// Processing Wallet Dialoge
const dialoges = [
    'Please wait while we process your WalletID: ',
    'Doodle: ',
    'Fusion Badge: ',
    'Silver Badge: ',
    'Gold Badge: ',
    'Diamond Badge: ',
    'Eternal Badge: ',
    'Doodle Arc Collectibles: ',
    'Congratulations, You received roles: '
];

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
        // Get Wallet ID
        const walletID = interaction.fields.getTextInputValue('walletID');

        // Process Initial Bot Reply
        await interaction.reply({
            content: dialoges[0]+walletID,
            ephemeral: true
        });        

        // Collect User Data
        const user = interaction.user;
        const userData = {id: user.id, username: user.username, vip: false, walletID: walletID };

        // Submit Data to firebase
        await addUser(fireBaseDB,userData);

        // Get User NFT Transaction Data using walletID
        

        // Wait 2 Seconds Every Process
        await wait(1000 * 5);

        const VIProleId = "973480269082406952";

        interaction.member.roles.add(
            findRole(interaction.guild.roles.cache,VIProleId)
        );
        //console.log(interaction.memberPermissions,interaction.member.roles);

        await interaction.editReply({content: 'You successfully sent your walletID!'});
    }
}