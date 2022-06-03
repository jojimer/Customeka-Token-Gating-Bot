const { MessageActionRow, Modal, TextInputComponent, MessageEmbed } = require('discord.js');
const { addUser, lookForDoodles, lookForBadges } = require(appRoot+'/db_management/control');
const { data } = require(appRoot+'/hedera/nfts');
const wait = require('node:timers/promises').setTimeout;
const findRole = (cache,roleId) => { return cache.find(r => r.id === roleId); };

// Processing Wallet Dialoge
// Doodles - Arc0-2, SpecialEdition, MetaFrost, Sweetizens
// Lazy Doodles - LSVKematian, LSVJester, LSHKjell, LSHCrawford, BlackCrawford, BlackZ
const dialoges = [
    'Please wait while we process your WalletID: ',
    'Doodles: ',
    'Doodle Punks: ',
    'Doodle Shadyz: ',
    'Lazy Doodles: ',
    'Fusion ',
    'Silver ',
    'Gold ',
    'Diamond ',
    'Eternal ',
    'Raffle Tickets: ',
    'Total Doodles: ',
    'Total Badges: ',
    'Congratulations, You received role/s: '
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
            .setRequired(true)
        )
    ),

    async execute(interaction) {
        // Get Wallet ID
        const walletID = interaction.fields.getTextInputValue('walletID');
        let content = dialoges[0]+"\n"+walletID;
        let itemsProccesed = 0;
        let totalDoodles = 0,
            totalDoodlePunks = 0,
            totalDoodleShadyz = 0,
            totalLazyDoodles = 0,
            totalFusions = 0,
            totalSilvers = 0,
            totalGolds = 0,
            totalDiamonds = 0, 
            totalEternals = 0,
            totalRaffleTickets = 0;

        let roleMap = [];

        const newEmbed = new MessageEmbed()
        .setColor('RANDOM').setTitle(content);

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

        // Count Doodles
        await wait(1000 * 1)
        await data.Doodles.forEach((token_id, index, array) => {
            lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
                totalDoodles += numb;                
                itemsProccesed++
                if(itemsProccesed === array.length){
                    newEmbed.addField(dialoges[1],totalDoodles.toString(),false);
                    interaction.editReply({embeds: [newEmbed]});
                    itemsProccesed = 0;
                    roleMap.push(totalDoodles);
                }        
            }));                       
        });

        // Count Doodle Punks
        await wait(1000 * 1)        
        await data.DoodlePunks.forEach((token_id, index, array) => {
            lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
                totalDoodlePunks += numb;
                itemsProccesed++
                if(itemsProccesed === array.length){
                    newEmbed.addField(dialoges[2],totalDoodlePunks.toString(),false);
                    interaction.editReply({embeds: [newEmbed]});
                    itemsProccesed = 0;
                    roleMap.push(totalDoodlePunks);
                } 
            }));
        });

        // Count Doodle Shadyz
        await wait(1000 * 1)
        await data.DoodleShadyz.forEach((token_id, index, array) => {
        lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
            totalDoodleShadyz += numb;
            itemsProccesed++
                if(itemsProccesed === array.length){
                    newEmbed.addField(dialoges[3],totalDoodleShadyz.toString(),false);
                    interaction.editReply({embeds: [newEmbed]});
                    itemsProccesed = 0;
                    roleMap.push(totalDoodleShadyz);
                }
            }));
        });

        // Count Lazy Doodles
        await wait(1000 * 1)
        await data.LazyDoodles.forEach((token_id, index, array) => {
            lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
                totalLazyDoodles += numb;
                itemsProccesed++
                if(itemsProccesed === array.length){
                    newEmbed.addField(dialoges[4],totalLazyDoodles.toString(),false);
                    interaction.editReply({embeds: [newEmbed]});
                    itemsProccesed = 0;
                    roleMap.push(totalLazyDoodles);
                }
            }));
        });

        // Count Fusions
        await wait(1000 * 1)
        const badges = data.Badges;
        await lookForBadges(fireBaseDB,walletID,badges.fusions,(numb => {
                totalFusions += numb;
                const newContent = (numb > 1) 
                    ? dialoges[5]+" Badges: " 
                    : dialoges[5]+" Badge: ";
                newEmbed.addField(newContent,totalFusions.toString(),false);
                interaction.editReply({embeds: [newEmbed]});
        }));

        // Count Silvers
        await wait(1000 * 1)
        await lookForBadges(fireBaseDB,walletID,badges.silvers,(numb => {
                totalSilvers += numb;
                const newContent = (numb > 1) 
                    ? dialoges[6]+" Badges: " 
                    : dialoges[6]+" Badge: ";
                newEmbed.addField(newContent,totalSilvers.toString(),false);
                interaction.editReply({embeds: [newEmbed]});
        }));

        // Count Golds
        await wait(1000 * 1)
        await lookForBadges(fireBaseDB,walletID,badges.golds,(numb => {
                totalGolds += numb;
                const newContent = (numb > 1) 
                    ? dialoges[7]+" Badges: " 
                    : dialoges[7]+" Badge: ";
                newEmbed.addField(newContent,totalGolds.toString(),false);
                interaction.editReply({embeds: [newEmbed]});
        }));

        // Count Diamonds
        await wait(1000 * 1)
        await lookForBadges(fireBaseDB,walletID,badges.diamonds,(numb => {
                totalDiamonds += numb;
                const newContent = (numb > 1) 
                    ? dialoges[8]+" Badges: " 
                    : dialoges[8]+" Badge: ";
                newEmbed.addField(newContent,totalDiamonds.toString(),false);
                interaction.editReply({embeds: [newEmbed]});
        }));

        // Count Eternals
        await wait(1000 * 1)
        await lookForBadges(fireBaseDB,walletID,badges.eternals,(numb => {
                totalEternals += numb;
                const newContent = (numb > 1) 
                    ? dialoges[9]+" Badges: " 
                    : dialoges[9]+" Badge: ";
                newEmbed.addField(newContent,totalEternals.toString(),false);
                interaction.editReply({embeds: [newEmbed]});
        }));

        // Count Raffle Tickets
        await wait(1000 * 1)        
        await data.RaffleTickets.forEach((token_id, index, array) => {
            lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
                totalRaffleTickets += numb;
                itemsProccesed++
                if(itemsProccesed === array.length){
                    newEmbed.addField(dialoges[10],totalRaffleTickets.toString(),false);
                    interaction.editReply({embeds: [newEmbed]});
                    itemsProccesed = 0;
                    roleMap.push(totalRaffleTickets);
                } 
            }));
        });

        // Count All Doodles
        await wait(1000 * 1) 
        const allDoodles = totalDoodles+totalDoodlePunks+totalDoodleShadyz+totalLazyDoodles;
        newEmbed.addField(dialoges[11],allDoodles.toString(),false);
        interaction.editReply({embeds: [newEmbed]});

        // Count Total Badges
        await wait(1000 * 1) 
        const allBadges = totalFusions+totalSilvers+totalGolds+totalDiamonds+totalEternals;
        newEmbed.addField(dialoges[12],allBadges.toString(),false);
        interaction.editReply({embeds: [newEmbed]});

        // Count Roles Received
        await wait(1000 * 1)
        newEmbed.addField(dialoges[13],"Arc Collectors, Raffle Participants",false);
        interaction.editReply({embeds: [newEmbed]});

        // // Count Doodles
        // content += "\n"+dialoges[1];
        // await data.Doodles.forEach((token_id, index, array) => {
        //     lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
        //         totalDoodles += numb;
        //         interaction.editReply({content: content+totalDoodles});
        //         itemsProccesed++
        //         if(itemsProccesed === array.length){
        //             content = content+totalDoodles;
        //             content += "\n"+dialoges[2];
        //             itemsProccesed = 0;
        //             roleMap.push(totalDoodles);
        //         }        
        //     }));                       
        // });

        // // Count Doodle Punks
        // await wait(1000 * 1)        
        // await data.DoodlePunks.forEach((token_id, index, array) => {
        //     lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
        //         totalDoodlePunks += numb;
        //         interaction.editReply({content: content+totalDoodlePunks});
        //         itemsProccesed++
        //         if(itemsProccesed === array.length){
        //             content = content+totalDoodlePunks;
        //             content += "\n"+dialoges[3];
        //             itemsProccesed = 0;
        //             roleMap.push(totalDoodlePunks);
        //         } 
        //     }));
        // });

        // // Count Doodle Shadyz
        // await wait(1000 * 1)
        // await data.DoodleShadyz.forEach((token_id, index, array) => {
        // lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
        //     totalDoodleShadyz += numb;
        //     interaction.editReply({content: content+totalDoodleShadyz});
        //     itemsProccesed++
        //         if(itemsProccesed === array.length){
        //             content = content+totalDoodleShadyz;
        //             content += "\n"+dialoges[4];
        //             itemsProccesed = 0;
        //             roleMap.push(totalDoodleShadyz);
        //         }
        //     }));
        // });

        // // Count Lazy Doodles
        // await wait(1000 * 1)
        // await data.LazyDoodles.forEach((token_id, index, array) => {
        //     lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
        //         totalLazyDoodles += numb;
        //         interaction.editReply({content: content+totalLazyDoodles});
        //         itemsProccesed++
        //         if(itemsProccesed === array.length){
        //             content = content+totalLazyDoodles;
        //             content += "\n"+dialoges[5];
        //             itemsProccesed = 0;
        //             roleMap.push(totalLazyDoodles);
        //         }
        //     }));
        // });

        // // Count Fusions
        // await wait(1000 * 1)
        // const badges = data.Badges;
        // await lookForBadges(fireBaseDB,walletID,badges.fusions,(numb => {
        //         totalFusions += numb;
        //         const newContent = (numb > 1) 
        //             ? content+" Doodles: " : content+" Doodle: ";
        //         interaction.editReply({content: newContent+totalFusions});
        //         content = newContent+totalFusions;
        //         content += "\n"+dialoges[6];
        // }));

        // // Count Silvers
        // await wait(1000 * 1)
        // await lookForBadges(fireBaseDB,walletID,badges.silvers,(numb => {
        //         totalSilvers += numb;
        //         const newContent = (numb > 1) 
        //             ? content+" Doodles: " : content+" Doodle: ";
        //         interaction.editReply({content: newContent+totalSilvers});
        //         content = newContent+totalSilvers;
        //         content += "\n"+dialoges[7];
        // }));

        // // Count Golds
        // await wait(1000 * 1)
        // await lookForBadges(fireBaseDB,walletID,badges.golds,(numb => {
        //         totalGolds += numb;
        //         const newContent = (numb > 1) 
        //             ? content+" Doodles: " : content+" Doodle: ";
        //         interaction.editReply({content: newContent+totalGolds});
        //         content = newContent+totalGolds;
        //         content += "\n"+dialoges[8];
        // }));

        // // Count Diamonds
        // await wait(1000 * 1)
        // await lookForBadges(fireBaseDB,walletID,badges.diamonds,(numb => {
        //         totalDiamonds += numb;
        //         const newContent = (numb > 1) 
        //             ? content+" Doodles: " : content+" Doodle: ";
        //         interaction.editReply({content: newContent+totalDiamonds});
        //         content = newContent+totalDiamonds;
        //         content += "\n"+dialoges[9];
        // }));

        // // Count Eternals
        // await wait(1000 * 1)
        // await lookForBadges(fireBaseDB,walletID,badges.eternals,(numb => {
        //         totalEternals += numb;
        //         const newContent = (numb > 1) 
        //             ? content+" Doodles: " : content+" Doodle: ";
        //         interaction.editReply({content: newContent+totalEternals});
        //         content = newContent+totalEternals;
        //         content += "\n"+dialoges[10];
        // }));

        // // Count Raffle Tickets
        // await wait(1000 * 1)        
        // await data.RaffleTickets.forEach((token_id, index, array) => {
        //     lookForDoodles(fireBaseDB,walletID,token_id,(numb => {
        //         totalRaffleTickets += numb;
        //         interaction.editReply({content: content+totalRaffleTickets});
        //         itemsProccesed++
        //         if(itemsProccesed === array.length){
        //             content = content+totalRaffleTickets;
        //             content += "\n"+dialoges[11];
        //             itemsProccesed = 0;
        //             roleMap.push(totalRaffleTickets);
        //         } 
        //     }));
        // });

        // // Count All Doodles
        // await wait(1000 * 1) 
        // const allDoodles = totalDoodles+totalDoodlePunks+totalDoodleShadyz+totalLazyDoodles;
        // content += allDoodles;
        // await interaction.editReply({content: content});

        // // Count Total Badges
        // await wait(1000 * 1) 
        // const allBadges = totalFusions+totalSilvers+totalGolds+totalDiamonds+totalEternals;
        // content += "\n"+dialoges[12]+allBadges;
        // roleMap.push(allBadges);
        // await interaction.editReply({content: content});

        // // Count Roles Received
        // await wait(1000 * 1)
        // content += "\n"+dialoges[13]+"Arc Collectors, Raffle Participants";
        // await interaction.editReply({content: content});
    }
}