const { searchAccount, searchNFTs, searchBadges } = require('../../search');
const { addUser, addHolderData, addVerificationLink, isAccountExist, } = require(appRoot+'/db_management/control');
const { Timestamp, doc } = require('firebase/firestore');
const { doodleNFTs } = require('./nfts');
const TokenGenerator = require('uuid-token-generator');
const { Console } = require('node:console');
const wait = require('node:timers/promises').setTimeout;
const baseURL = "https://connect.customeka.xyz/p/";
const discord = "https://discord.com/channels";

// Get Default Data(Dialoges, Type, Keys)
const defaultD = (data) => {
    return {
        dialoges: data.Dialoges,
        badges: data.Badges,
        roles: data.Roles,
        rolesReceived: [],
        webhook: data.webhook,
        randomNumb: () => ~~(Math.random() * (7 - 5 + 5) + 5),
        noNFTs: { bool: true, content: "Sorry you don't have any "+data.memberCalled+" in your wallet!" },
        validateDialoge: {
            invalidWalletID: "The wallet ID you entered is invalid, please try again!\n",
            walletIdClamed: "You already verified your wallet ID with the account number of: ",
            alreadyVerified: "Your discord account and wallet ID is already verified! ",
            directToSupportTicket: "Please reach out our team if you need a technical support by making a ticket on #-Ticket Support Channel"
        },
        channel: data.channel,
        projectKey: data.projectKey,
        everyone: data.everyone
    }
}

// Roles Identifyer
const roleIdentifyer = async (token_id,defaultData, bagde_key = false) => {
    const roles = defaultData.roles;
    let choices;
    
    if(typeof bagde_key !== "string"){
        choices = Object.keys(roles).filter(key => {
            if(roles[`${key}`].token_id.filter(token => token_id === token).length !== 0) return roles[`${key}`].roleName;
        });
    }else{        
        choices = Object.keys(roles).filter(key => {
            if(roles[`${key}`].token_id.filter(token => token_id === token).length !== 0 && roles[`${key}`].key === bagde_key) return roles[`${key}`].roleName;
        });
        if(choices.length !== 0 && defaultData.rolesReceived.indexOf("badgeHolder") === -1) choices.push("badgeHolder");
    }

    if(choices.length && defaultData.rolesReceived.indexOf(...choices) === -1)
        defaultData.rolesReceived.push(...choices);
    
    return;
}

module.exports = {
    validateWalletID: (account_id, interaction, embed, directory, callback) => {
        const defaultData = defaultD(doodleNFTs);
        const dialoge = defaultData.validateDialoge;
        const currentUser = interaction.user.id;
        const claimBTN = interaction.client.buttons.find(btn => btn.data.claimBTN).data.claimBTN;
        const reclaimBTN = interaction.client.buttons.find(btn => btn.data.reclaimRole).data.reclaimRole;
        const localDirectory = appRoot+"/local_database/verified_members";
        const reply = (d,i = 'error') => {
            let finalLoading = "|".repeat(100/ 1.8)+" 100%";
            return embed.setFooter({
                text: d+finalLoading,
                iconURL: icon[`${i}`]
            });            
        }

        const calculateTime = (expiration) => {
            const timeLeft = expiration.seconds - Timestamp.now().seconds;
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            return minutes + (minutes > 1 ? ' minutes' : ' minute') + ' and ' + (seconds < 10 ? '0' : '') + seconds + (seconds > 1 ? ' seconds' : ' second');
        }

        // Search user wallet ID in mirror-node
        searchAccount(account_id,(async confirmation => {
            // Get validity account_id confirmation
            if(!confirmation){
                let message = reply(dialoge.invalidWalletID);
                await interaction.editReply({embeds: [message]});
                callback(false);
            }else{
                const discord_id = interaction.user.id;
                // Check if user already on the database with valid wallet ID
                isAccountExist(discord_id,directory,(async info => {
                    // User no user set to false
                    const user = (info) ? info[0] : false;

                    // Check if current user is trying to register different account ID from the one previously registered
                    if(user && account_id !== user.walletID){
                        let message = reply(dialoge.walletIdClamed+user.walletID+"\n\nYou can't register two wallet ID in one discord account.\n\n");
                        interaction.editReply({embeds: [message]});
                        callback(false);
                    }// Check if current user is verified
                    else if(user && user.verified === 'claimed'){
                        const uLocal = require(localDirectory+'/'+currentUser);
                        if(uLocal.roles.length > 0){
                            let currentRoles = [];
                            let claimedText = '';
                            
                            await interaction.member.roles.cache.each(async role => {
                                if(role.name !== '@everyone'){
                                    Object.keys(defaultData.roles).map(v => {
                                        if(v.roleName == role.name) currentRoles.push(role.name);
                                    })
                                }                    
                            });

                            const difference = uLocal.roles.filter(r => !currentRoles.includes(r.name));

                            if(difference.length === uLocal.roles.length){
                                let message = reply(dialoge.alreadyVerified+"\n\n",'success');
                                 interaction.editReply({embeds: [message]});
                            }else{
                                difference.map(r => claimedText += `<@&${r.role_id}> `);
                                reply(dialoge.alreadyVerified+", \nbut you have unclaimed roles, get it now! \n\n ",'success');
                                let rcEmbed = embed.setTitle("Click the button to reclaim your roles!");
                                interaction.editReply({embeds: [rcEmbed], components: [reclaimBTN]});

                                const filter = i => i.user.id === currentUser;

                                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 10000 });

                                collector.on('collect', async i => {
                                    await interaction.editReply({ embeds: [rcEmbed.setTitle('You Successfully Reclaimed Roles.').setColor('#379c6f').setFooter({
                                        text: ' ',
                                        iconURL: null
                                    }).setDescription('**Roles Reclaimed:** '+claimedText)], components: [] });
                                });
                            }
                        }

                        callback(false);                        

                    
                    }// Check if current user still have time to verify account
                    else if(user && user.verification_time.seconds > Timestamp.now().seconds){
                        let roles = "";
                        let roleText = "roles:";

                        // Chage text if role is equal to 1
                        if(user.roles.length === 1){
                            claimBTN.components[0].setLabel('Claim Role');
                            roleText = "role:";
                        }

                        // Set Embed Message
                        let message = reply('You still have '+calculateTime(user.verification_time)+' to claim your '+roleText+' \n\n'+roles+'\n\n','success')
                        
                        // Send Edit Reply Embeds & Button
                        interaction.editReply({embeds: [message], components: [claimBTN]});
                        callback(false);
                    }else{                       
                    // No wallet ID record found from firebase
                        callback(true);
                    }
                }));
            }
        }));
    },
    processWallet: async (walletID,interaction,embed,directory) => {
        const defaultData = defaultD(doodleNFTs);
        const dialoges = defaultData.dialoges;
        const badges = defaultData.badges;
        const noNFTs = defaultData.noNFTs;
        const rolesReceived = defaultData.rolesReceived;
        const randomNumb = defaultData.randomNumb;
        const keyExpiration = (Date.now() + 60000*16);
        const claimBTN = interaction.client.buttons.find(btn => btn.data.claimBTN).data.claimBTN;
        const nftData =  interaction.client.nft.get('data');
        const redirectChannel = discord+'/'+nftData.guild_id+'/'+nftData.channels.announcement;
        //console.log(redirectChannel);

        // Collect User Data
        const user = interaction.user;
        const verificationKey = new TokenGenerator().generate();
        const verificationTime = Timestamp.fromMillis(keyExpiration);
        const userData = {
            id: user.id, 
            username: user.username,
            verified: "pending",
            verification_key: verificationKey,
            verification_time: verificationTime,
            holders_data: doc(fireBaseDB,'holders',user.id),
            vip: false,
            walletID: walletID,
            roles: []
            
        };

        const verifyData = {
            id: verificationKey,
            time: verificationTime,
            discord_id: user.id,
            wallet_id: walletID,
            projectName: defaultData.projectKey,
            roles: [],
            complete: false,
            redirect: redirectChannel
        }

        const holderData = {
            id: user.id,
            username: user.username,
            nfts: {},
            badges: {}
        };

        let itemsProccesed = 0;
        let loading = 0;

        for(let i=0; i<=dialoges.length-1; i++){
            const type = dialoges[i].type;
            const key = dialoges[i].key;
            const tokenIDs = (type === 'doodle' || type === 'raffleTicket') 
                    ? doodleNFTs[`${key}`]
                    : (type === 'badge') ? badges[`${key}`] : false;
            let content = dialoges[i].content;

            if(type === 'doodle' || type === 'raffleTicket')
                await tokenIDs.forEach(async token_id => {
                    searchNFTs(walletID,token_id,(data => {
                        const numb = data.total;                        
                        // Get Role
                        if(numb !== 0) {
                            roleIdentifyer(token_id,defaultData);
                            holderData.nfts[`${token_id}`] = data.nft[`${token_id}`];
                        }

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
                await searchBadges(walletID,tokenIDs,key,(data => {
                    const numb = data.total;
                    // Increment Number of Badges in single Token ID
                    if(numb !== 0){
                        roleIdentifyer(tokenIDs[0],defaultData,key);
                        holderData.badges[`${key}`] = data.badges[`${key}`];
                    }

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
                const finalDialoge = [[""],[""]];

                if(!noNFTs.bool) {
                    finalDialoge[0] = (rolesReceived.length > 1) ? dialoges[i].content+"s: " : dialoges[i].content;
                    rolesReceived.map(key => {
                        finalDialoge[1] += "- "+defaultData.roles[`${key}`].roleName+"\n";

                        const role = {
                            name: defaultData.roles[`${key}`].roleName,
                            role_id: defaultData.roles[`${key}`].role_id
                        };

                        userData.roles.push(role);
                        verifyData.roles.push(role);
                    });
                    finalDialoge[0] += "\n\n"+finalDialoge[1]+"\n\nLink will expire in 15 minutes, claim roles now!";
                }else{
                    finalDialoge[0] = noNFTs.content;
                }

                let finalLoading = "|".repeat(100 / 1.8)+" 100%";
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
                    text: "|".repeat(loading / 1.8)+" "+loading+"%",
                    iconURL: icon.loading
                });
                interaction.editReply({embeds: [embed]});
            }

            await wait(1000 * 1)
        }

        if(verifyData.roles.length !== 0) {
            await addUser(userData,directory);
            await addHolderData(holderData,directory);
            await addVerificationLink(verifyData,directory);
            await wait(1000);

            if(verifyData.length === 1) claimBTN.components[0].setLabel('Claim Role');
            claimBTN.components[0].setURL(baseURL+`${defaultData.projectKey}/`+verifyData.id);
            interaction.editReply({components: [claimBTN]});
        }
    },
    monitorWallet: async (user,callback) => {
        const defaultData = defaultD(doodleNFTs);
        const dialoges = defaultData.dialoges.filter(v => v.type !== 'dialoge');
        const badges = defaultData.badges;
        const rolesReceived = defaultData.rolesReceived;
        const walletID = user.wallet;
        const getRoles = async (roles,userData) => {
            await roles.map(key => {
                const role = {
                    name: defaultData.roles[`${key}`].roleName,
                    role_id: defaultData.roles[`${key}`].role_id
                };
                //console.log(key,role)
    
                userData.roles.push(role);
                userData.holding = holderData;
                //console.log(userData);            
            });
            return userData;
        }

        const userData = {
            id: user.id, 
            username: user.username,
            roles: []
        };

        const holderData = {
            id: user.id,
            username: user.username,
            nfts: {},
            badges: {}
        };
        let x = 0;
        await dialoges.map(async (v,i) => {
                x++;
                const type = v.type;            
                const key = v.key;
                const tokenIDs = (type === 'doodle' || type === 'raffleTicket') 
                        ? doodleNFTs[`${key}`]
                        : (type === 'badge') ? badges[`${key}`] : false;

                if(type === 'doodle' || type === 'raffleTicket')
                    await tokenIDs.forEach(async token_id => {
                        await searchNFTs(walletID,token_id,(async data => {
                            const numb = data.total;                        
                            // Get Role
                            if(numb !== 0) {
                                await roleIdentifyer(token_id,defaultData);
                                holderData.nfts[`${token_id}`] = data.nft[`${token_id}`];
                            }
                        }));      
                    });

                if(type === 'badge')
                    await searchBadges(walletID,tokenIDs,key,(async data => {
                        const numb = data.total;
                        // Increment Number of Badges in single Token ID
                        if(numb !== 0){                            
                            await roleIdentifyer(tokenIDs[0],defaultData,key);
                            holderData.badges[`${key}`] = data.badges[`${key}`];
                        }
                    }));
        })

        await wait(1000 * 12.5);
        const r = await getRoles(rolesReceived,userData);
        //console.log(r)
        await callback(r);
    }
}