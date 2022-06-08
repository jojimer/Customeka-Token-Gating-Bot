const { searchAccount, searchNFTs, searchBadges } = require('./search');
const { addUser, isUserExist } = require(appRoot+'/db_management/control');
const { data } = require('./nfts');
const wait = require('node:timers/promises').setTimeout;

// Get Default Data(Dialoges, Type, Keys)
const defaultData = {
    dialoges: data.Dialoges,
    badges: data.Badges,
    roles: data.Roles,
    rolesReceived: [],
    randomNumb: () => ~~(Math.random() * (7 - 5 + 5) + 5),
    noNFTs: { bool: true, content: "Sorry you don't have any Doodle in your wallet!" },
    validateDialoge: {
        invalidWalletID: "The wallet ID you entered is invalid, please try again!\n",
        walletIdClamed: "The wallet ID you entered has been recorded under Doodle Member: ",
        directToSupportTicket: "Please reach out our team if you need a technical support by making a ticket on #-Ticket Support Channel"
    }
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
        const dialoge = defaultData.validateDialoge;        
        const reply = (d) => {
            let finalLoading = "|".repeat(100/ 1.75)+" 100%";
            return embed.setFooter({
                text: d+finalLoading,
                iconURL: icon.error
            });            
        }

        // Search user wallet ID in mirror-node
        searchAccount(account_id,(async confirmation => {
            // Get validity account_id confirmation
            if(!confirmation){
                let message = reply(dialoge.invalidWalletID);
                await interaction.editReply({embeds: [message]});
                callback(false);
            }else{
                // Check if user already on the database with valid wallet ID
                isUserExist(fireBaseDB,account_id,(async user => {
                    if(user !== false){
                        let message = reply(dialoge.walletIdClamed+"\n\n- @"+user[0].username+"\n\n");
                        interaction.editReply({embeds: [message]});
                        callback(false);
                    }else{
                        callback(true);
                    }
                }));
            }
        }));
    },
    processWallet: async (walletID,interaction,embed) => {
        const dialoges = defaultData.dialoges;
        const badges = defaultData.badges;
        const noNFTs = defaultData.noNFTs;
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
                            if(noNFTs.bool && dialoges[i].total > 0) noNFTs.bool = false;
                            dialoges[i].total = 0;
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
                        if(noNFTs.bool && dialoges[i].total > 0) noNFTs.bool = false;
                        dialoges[i].total = 0;
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
                const iconURL = (noNFTs.bool) ? icon.error : icon.success;           
                const finalDialoge = [];

                if(!noNFTs.bool) {    
                    finalDialoge[0] = (rolesReceived.length > 1) ? dialoges[i].content+"s: " : dialoges[i].content;
                    rolesReceived.map(key => { finalDialoge[1] += "- "+data.Roles[`${key}`].roleName+"\n"; });
                    finalDialoge[0] += "\n\n"+finalDialoge[1];
                }else{
                    finalDialoge[0] = noNFTs.content;
                }

                let finalLoading = "|".repeat(100 / 1.75)+" 100%";
                embed.setFooter({
                    text: finalDialoge[0]+"\n"+finalLoading,
                    iconURL: iconURL
                });

                interaction.editReply({embeds: [embed]});
                rolesReceived.length = 0;
                noNFTs.bool = true;
                loading = 0;
            }else{
                loading += randomNumb();
                if(loading >= 100 ) loading = 98;
                embed.setFooter({
                    text: "|".repeat(loading / 1.75)+" "+loading+"%",
                    iconURL: icon.loading
                });
                interaction.editReply({embeds: [embed]});
            }

            await wait(1000 * 1)
        }
    }
}