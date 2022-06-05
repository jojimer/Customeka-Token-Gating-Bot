const { MessageActionRow, Modal, TextInputComponent, MessageEmbed } = require('discord.js');
const { start } = require('node:repl');
const { addUser, lookForDoodles, lookForBadges } = require(appRoot+'/db_management/control');
const { data } = require(appRoot+'/hedera/nfts');
const wait = require('node:timers/promises').setTimeout;
const findRole = (cache,roleId) => { return cache.find(r => r.id === roleId); };

// Get All Dialoges, Type, Keys
const dialoges = data.Dialoges;
const rolesReceived = [];
const randomNumb = () => ~~(Math.random() * (7 - 4 + 4) + 4);
let loading = 0;
const icon = {
    start: "http://assets.stickpng.com/thumbs/5a007221092a74e5b928e78b.png",
    finish: "http://assets.stickpng.com/thumbs/5aa78e267603fc558cffbf1a.png"
}

// Roles Identifyer
const roleIdentifyer = async (token_id) => {
    // Get Role Lists
    const roles = data.Roles;

    let choices = Object.keys(roles).filter(key => {
        let tokenID = roles[`${key}`].token_id.filter(token => token_id === token);
        if(tokenID.length !== 0) return roles[`${key}`].roleName;
    });

    if(choices.length && rolesReceived.indexOf(...choices) === -1)
        rolesReceived.push(...choices);        
}

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
        let content = dialoges[0];
        let itemsProccesed = 0;

        let roleMap = [];

        const newEmbed = new MessageEmbed()
        .setColor('RANDOM').setTitle(content)
        .setDescription(walletID).setFooter({text: "| 0%", iconURL: icon.start});

        // Process Initial Bot Reply
        await interaction.reply({
            embeds: [newEmbed],
            ephemeral: true
        });        

        // Collect User Data
        const user = interaction.user;
        const userData = {id: user.id, username: user.username, vip: false, walletID: walletID };

        // Submit Data to firebase
        await addUser(fireBaseDB,userData);

        for(let i=1; i<=dialoges.length-1; i++){
            const type = dialoges[i].type;
            const key = dialoges[i].key;
            const tokenIDs = (type === 'doodle' || type === 'raffleTicket') 
                    ? data[`${key}`]
                    : (type === 'badge') ? data.Badges[`${key}`] : false;
            let content = dialoges[i].content;

            if(type === 'doodle' || type === 'raffleTicket')
                tokenIDs.forEach(async token_id => {
                    await lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
                        // Get Role
                        if(numb !== 0) roleIdentifyer(token_id);
                        // Increment Number Doodle in Single Token ID
                        if(numb > 0) dialoges[i].total += numb;
                        // Increment Overall Doodles
                        if(numb > 0 && key !== 'RaffleTickets') dialoges[11].total += numb;  
                        itemsProccesed++
                        if(itemsProccesed === tokenIDs.length){
                            content = (key === 'RaffleTickets' && dialoges[i].total > 1)
                                ? "Raffle Tickets: " : content;
                            newEmbed.addField(content,dialoges[i].total.toString(),false);
                            interaction.editReply({embeds: [newEmbed]});
                            itemsProccesed = 0;
                            dialoges[i].total = 0;
                            return;
                        }        
                    }));
                    await wait(1000);        
                });

            if(type === 'badge')
                await lookForBadges(fireBaseDB,walletID,tokenIDs,(numb => {
                        // Increment Number of Badges in single Token ID
                        const badges = dialoges[i].total += numb;
                        // Increment Overall Badges
                        if(numb > 0) dialoges[12].total += badges;
                        const sp = (numb > 1) ? " Badges: " : " Badge: ";
                        newEmbed.addField(content+sp,badges.toString(),false);
                        interaction.editReply({embeds: [newEmbed]});
                        dialoges[i].total = 0;
                        return;
                }));

            if(type === 'dialoge' && key === 'TotalDoodle'){
                // Total Doodles
                const totalDoodles = dialoges[i].total;
                const sp = (totalDoodles > 1) ? "s: " : ": ";
                newEmbed.addField(content+sp,totalDoodles.toString(),false);
                interaction.editReply({embeds: [newEmbed]});
                dialoges[i].total = 0;
            }
            
            if(type === 'dialoge' && key === 'TotalBadge'){
                // Total Badges
                const totalBadges = dialoges[i].total;
                const sp = (totalBadges > 1) ? "s: " : ": ";
                newEmbed.addField(content+sp,totalBadges.toString(),false);
                interaction.editReply({embeds: [newEmbed]});
                dialoges[i].total = 0;
            }

            // Total Roles Received
            if(key === 'Roles'){
                let allRoles = "";
                let finalDialoge = (rolesReceived.length > 1) 
                    ? dialoges[i].content+"s: " : dialoges[i].content;
                rolesReceived.map(key => { allRoles += "- "+data.Roles[`${key}`].roleName+"\n"; });

                let finalLoading = "|".repeat(100)+" 100%";
                newEmbed.setFooter({
                    text: finalDialoge+"\n\n"+allRoles+"\n"+finalLoading,
                    iconURL: icon.finish
                });
                interaction.editReply({embeds: [newEmbed]});
                rolesReceived.length = 0;
                loading = 0;
            }else{
                loading += randomNumb();
                newEmbed.setFooter({
                    text: "|".repeat(loading)+" "+loading+"%",
                    iconURL: icon.start
                });
                interaction.editReply({embeds: [newEmbed]});
            }

            await wait(1000 * 1)
        }
    }
}