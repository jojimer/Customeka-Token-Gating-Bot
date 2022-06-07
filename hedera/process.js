const { searchAccount, searchNFTs, searchBadges } = require('./search');
const { data } = require('./nfts');
const wait = require('node:timers/promises').setTimeout;

// Get Default Data(Dialoges, Type, Keys)
const defaultData = {
    dialoges: data.Dialoges,
    badges: data.Badges,
    roles: data.Roles,
    rolesReceived: [],
    randomNumb: () => ~~(Math.random() * (7 - 5 + 5) + 5),
    noNFTs: "Sorry you don't have any Doodle in your wallet!",
    walletIdClamed: "The wallet ID you entered has been recorded under Doodle Member:[Member User Name]",
    directToSupportTicket: "Please reach out our team if you need a technical support by making a ticket on #-Ticket Support Channel"
}

// Roles Identifyer
const roleIdentifyer = async (token_id) => {
    const roles = defaultData.roles;

    let choices = Object.keys(roles).filter(key => {
        let tokenID = roles[`${key}`].token_id.filter(token => token_id === token);
        if(tokenID.length !== 0) return roles[`${key}`].roleName;
    });

    if(choices.length && defaultData.rolesReceived.indexOf(...choices) === -1)
    defaultData.rolesReceived.push(...choices);        
}

module.exports = {
    validateWalletID: (account_id, interaction, embed, callback) => {
        searchAccount(account_id,(async result => {
            if(!result){
                let finalLoading = "|".repeat(100)+" 100%";
                embed.setFooter({
                    text: "The wallet ID you enetered is invalid, please try again!\n"+finalLoading,
                    iconURL: icon.error
                });
                interaction.editReply({embeds: [embed]});
            }

            await callback(result);
        }));
    },
    processWallet: async (walletID,interaction,embed) => {
        const dialoges = defaultData.dialoges;
        const badges = defaultData.badges;
        const rolesReceived = defaultData.rolesReceived;
        const randomNumb = defaultData.randomNumb;
        let itemsProccesed = 0;
        let loading = 0;

        for(let i=0; i<=dialoges.length-1; i++){
            const type = dialoges[i].type;
            const key = dialoges[i].key;
            const tokenIDs = (type === 'doodle' || type === 'raffleTicket') 
                    ? data[`${key}`]
                    : (type === 'badge') ? badges[`${key}`] : false;
            let content = dialoges[i].content;

            if(type === 'doodle' || type === 'raffleTicket')
                await tokenIDs.forEach(async token_id => {
                    searchNFTs(walletID,token_id,(numb => {
                        // Get Role
                        if(numb !== 0) roleIdentifyer(token_id);
                        // Increment Number Doodle in Single Token ID
                        if(numb > 0) dialoges[i].total += numb;
                        // Increment Overall Doodles
                        if(numb > 0 && key !== 'RaffleTickets') dialoges[10].total += numb;  
                        itemsProccesed++
                        if(itemsProccesed === tokenIDs.length){
                            content = (key === 'RaffleTickets' && dialoges[i].total > 1)
                                ? "Raffle Tickets: " : content;
                            embed.addField(content,dialoges[i].total.toString(),false);
                            interaction.editReply({embeds: [embed]});
                            itemsProccesed = 0;
                            dialoges[i].total = 0;
                            return;
                        }        
                    }));

                    await wait(1000);        
                });

            if(type === 'badge')
                await searchBadges(walletID,tokenIDs,(numb => {
                        // Increment Number of Badges in single Token ID
                        if(numb !== 0) roleIdentifyer(tokenIDs[0]);
                        const badges = dialoges[i].total += numb;
                        // Increment Overall Badges
                        if(numb > 0) dialoges[11].total += badges;
                        const sp = (numb > 1) ? " Badges: " : " Badge: ";
                        embed.addField(content+sp,badges.toString(),false);
                        interaction.editReply({embeds: [embed]});
                        dialoges[i].total = 0;
                        return;
                }));

            if(type === 'dialoge' && key === 'TotalDoodle'){
                // Total Doodles
                const totalDoodles = dialoges[i].total;
                const sp = (totalDoodles > 1) ? "s: " : ": ";
                embed.addField(content+sp,totalDoodles.toString(),false);
                interaction.editReply({embeds: [embed]});
                dialoges[i].total = 0;
            }
            
            if(type === 'dialoge' && key === 'TotalBadge'){
                // Total Badges
                const totalBadges = dialoges[i].total;
                const sp = (totalBadges > 1) ? "s: " : ": ";
                embed.addField(content+sp,totalBadges.toString(),false);
                interaction.editReply({embeds: [embed]});
                dialoges[i].total = 0;
            }

            // Total Roles Received
            if(key === 'Roles'){
                let allRoles = "";
                let finalDialoge = (rolesReceived.length > 1) 
                    ? dialoges[i].content+"s: " : dialoges[i].content;
                rolesReceived.map(key => { allRoles += "- "+data.Roles[`${key}`].roleName+"\n"; });

                let finalLoading = "|".repeat(100)+" 100%";
                embed.setFooter({
                    text: finalDialoge+"\n\n"+allRoles+"\n"+finalLoading,
                    iconURL: icon.success
                });
                interaction.editReply({embeds: [embed]});
                rolesReceived.length = 0;
                loading = 0;
            }else{
                loading += randomNumb();
                if(loading >= 100 ) loading = 98;
                embed.setFooter({
                    text: "|".repeat(loading)+" "+loading+"%",
                    iconURL: icon.loading
                });
                interaction.editReply({embeds: [embed]});
            }

            await wait(1000 * 1)
        }
    }
}