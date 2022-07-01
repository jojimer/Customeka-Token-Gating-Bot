const { searchAccount, searchNFTs } = require('./search');
const { addUser, addHolderData, addVerificationLink, isAccountExist, updateUserAccount } = require(appRoot+'/db_management/control');
const { Timestamp, doc } = require('firebase/firestore');
const { SERPENTS } = require('./nfts');
const TokenGenerator = require('uuid-token-generator');
const wait = require('node:timers/promises').setTimeout;
const baseURL = "https://connect.customeka.xyz/";

// Get Default Data(Dialoges, Type, Keys)
const default_OBJ =  {
    dialoges: SERPENTS.Dialoges,
    serpentCharmerCondition: [
        {tenSerpent: 0,},
        {oneOGVIPer: 0,fiveSerpent: 0,oneVIPer: 0}
    ],
    VIPerCondition: [
        {oneCyberSerpent: 0, oneUkraineSerpent: 0},
        {fiveSerpent: 0}
    ],
    roles: SERPENTS.Roles,
    rolesReceived: [],
    randomNumb: () => ~~(Math.random() * (7 - 5 + 5) + 5),
    noNFTs: { bool: true, content: "“It looks like you do not hold a Serpent NFT! "+SERPENTS.memberCalled+" \n\nIf you would like one, please visit www.TheSerpentProject.com to mint a Gen 2. \n\nIf sold out, you can find them on the secondary market or on Zuse!”" },
    validateDialoge: {
        invalidWalletID: "The wallet ID you entered is invalid, please try again!\n",
        walletIdClamed: "It looks like this wallet ID is already in use. ",
        alreadyVerified: "Your account and wallet ID is already verified! ",
        directToSupportTicket: "PleaSssse message the Staff and we will be right with you!"
    },
    channel: SERPENTS.channel,
    projectKey: SERPENTS.projectKey,
    guild_id: SERPENTS.guild_id,
    announcement_id: SERPENTS.anouncement_id
}

// Roles Identifyer
const roleIdentifyer = async (token_id,totalPer_token) => {
    const roles = default_OBJ.roles;

    let choices = Object.keys(roles).filter(key => {;
        let tokenID = roles[`${key}`].nfts.filter(nft => token_id === nft.token_id && nft.condition <= totalPer_token && key !== "VIPer" && key !== "serpentCharmer" );
        if(tokenID.length !== 0) return roles[`${key}`].roleName;
    });

    // console.log(choices);

    // Qualifying for Serpent Charmer
    if(["0.0.794863","0.0.744276","0.0.996741","0.0.662854","0.0.996741"].indexOf(token_id) != -1){
        // Serpent Charmer Case 1
        if(token_id === "0.0.996741") default_OBJ.serpentCharmerCondition[0].tenSerpent = totalPer_token;
        // Serpent Charmer Case 2
        if(token_id === "0.0.662854") default_OBJ.serpentCharmerCondition[1].oneOGVIPer = totalPer_token;
        if(token_id === "0.0.996741") default_OBJ.serpentCharmerCondition[1].fiveSerpent = totalPer_token;
        if(["0.0.794863","0.0.744276"].indexOf(token_id) != -1) default_OBJ.serpentCharmerCondition[1].oneVIPer += totalPer_token;
    }

    // Qualifying for VIPer
    if(["0.0.794863","0.0.744276","0.0.996741"].indexOf(token_id) != -1){
        // Case 1 
        if(token_id === "0.0.794863") default_OBJ.VIPerCondition[0].oneCyberSerpent = totalPer_token;
        if(token_id === "0.0.744276") default_OBJ.VIPerCondition[0].oneUkraineSerpent = totalPer_token;
        // Case 2
        if(token_id === "0.0.996741") default_OBJ.VIPerCondition[1].fiveSerpent = totalPer_token;
    }
    
    // If roles not yet acquired
    if(choices.length && default_OBJ.rolesReceived.indexOf(...choices) === -1)
    default_OBJ.rolesReceived.push(...choices);
    //console.log(default_OBJ.rolesReceived)
}

module.exports = {
    validateWalletID: (account_id, interaction, embed, callback) => {
        const dialoge = default_OBJ.validateDialoge;
        const currentUser = interaction.user.id;
        const claimBTN = interaction.client.buttons.find(btn => btn.data.claimBTN).data.claimBTN;
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
                // Check if user already on the database with valid wallet ID
                isAccountExist(fireBaseDB,account_id,(async info => {
                    // User no user set to false
                    const user = (info) ? info[0] : false;

                    // Check if current user and the user with same wallet ID is same
                    if(user && currentUser !== user.id){
                        let message = reply(dialoge.walletIdClamed+"\n\n- @"+user.username+"\n\n");
                        interaction.editReply({embeds: [message]});
                        callback(false);
                    
                    // Check if current user is verified
                    }else if(user && user.verified === 'claimed'){
                        let message = reply(dialoge.alreadyVerified+"\n\n",'success');
                        interaction.editReply({embeds: [message]});
                        callback(false);

                    // Check if current user still have time to verify account
                    }else if(user && user.verification_time.seconds > Timestamp.now().seconds){
                        let roles = "";
                        let roleText = "roles:";

                        // Chage text if role is equal to 1
                        if(user.roles.length === 1){
                            claimBTN.components[0].setLabel('Claim Role');
                            roleText = "role:";
                        }

                        // Set button URL
                        claimBTN.components[0].setURL(baseURL+`${default_OBJ.projectKey}/`+user.verification_key);

                        // Load roles from Array                      
                        user.roles.map(val => roles+= val.name+"\n" );

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
    processWallet: async (walletID,interaction,embed) => {
        const dialoges = default_OBJ.dialoges;
        const noNFTs = default_OBJ.noNFTs;
        const rolesReceived = default_OBJ.rolesReceived;
        const randomNumb = default_OBJ.randomNumb;
        const keyExpiration = (Date.now() + 60000*16);
        const claimBTN = interaction.client.buttons.find(btn => btn.data.claimBTN).data.claimBTN;

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
            roles: [],
            pairing_data: {},
        };

        const verifyData = {
            id: verificationKey,
            time: verificationTime,
            discord_id: user.id,
            wallet_id: walletID,
            projectName: default_OBJ.projectKey,
            roles: [],
            complete: false,
            redirect: default_OBJ.channel.announcement,
            guild_id: default_OBJ.guild_id
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
            const tokenIDs = SERPENTS[`${key}`];
            let content = dialoges[i].content;

            if(type === 'serpent')
                await tokenIDs.forEach(async token_id => {
                    searchNFTs(walletID,token_id,(data => {
                        const numb = data.total;                
                        // Get Role
                        if(numb !== 0) {                            
                            holderData.nfts[`${token_id}`] = data.nft[`${token_id}`];
                        }

                        if(numb > 0) {
                            // Increment Number Serpents in Single Token ID
                            dialoges[i].total += numb;
                            // Increment Overall Serpent
                            dialoges[5].total += numb;                            
                        }
                        itemsProccesed++
                        if(itemsProccesed === tokenIDs.length){                            
                            if(dialoges[i].total) roleIdentifyer(token_id,dialoges[i].total);              
                            embed.addField(content,dialoges[i].total.toString(),false);
                            interaction.editReply({embeds: [embed]});
                            itemsProccesed = 0;
                            if(noNFTs.bool && dialoges[i].total > 0) noNFTs.bool = false;
                            dialoges[i].total = 0;
                        }        
                    }));

                    await wait(1000);        
                });

            // Total Serpent Dialog
            if(type === 'dialoge' && key === 'TotalSerpent'){
                // Count Total Serpents
                const totalSerpent = dialoges[i].total;
                const sp = (totalSerpent > 1) ? "s: " : ": ";
                embed.addField(content+sp,totalSerpent.toString(),false);
                interaction.editReply({embeds: [embed]});
                dialoges[i].total = 0;
            }

            // Serpent Charmer & VIPer Dialog
            if(type === 'dialoge' && key === 'serpentCharmer' || key === 'VIPer'){
                let bool = false;
                if(key === 'serpentCharmer'){
                    const condition = default_OBJ.serpentCharmerCondition;
                    if(condition[0].tenSerpent >= 10) bool = true;
                    if(!bool && condition[1].oneOGVIPer >= 1 && (condition[1].fiveSerpent >= 5 || condition[1].oneVIPer >= 1)) bool = true;
                    if(bool) default_OBJ.rolesReceived.push("serpentCharmer");
                }

                if(key === 'VIPer'){
                    const condition = default_OBJ.VIPerCondition;
                    if(condition[0].oneCyberSerpent >= 1 || condition[0].oneUkraineSerpent >= 1) bool = true;
                    if(!bool && condition[1].fiveSerpent >= 5 ) bool = true;
                    if(bool) default_OBJ.rolesReceived.push("VIPer");
                }

                // TODO: Add X or Check if supreme badges unlock
                // embed.addField(content+sp,bool.toString(),false);
                // interaction.editReply({embeds: [embed]});
                // dialoges[i].total = false;
            }

            // Total Roles Dialog
            if(key === 'Roles'){
                const iconURL = (noNFTs.bool) ? icon.error : icon.success;           
                const finalDialoge = [[""],[""]];

                if(!noNFTs.bool) {
                    finalDialoge[0] = (rolesReceived.length > 1) ? dialoges[i].content+"s: " : dialoges[i].content;
                    rolesReceived.map(key => {
                        finalDialoge[1] += "- "+default_OBJ.roles[`${key}`].roleName+"\n";

                        const role = {
                            name: default_OBJ.roles[`${key}`].roleName,
                            role_id: default_OBJ.roles[`${key}`].role_id
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
        
        if(verifyData.roles.length !== 0) { // I add @everyone as roles
            await addUser(fireBaseDB,userData);
            await addHolderData(fireBaseDB,holderData);
            await addVerificationLink(fireBaseDB,verifyData);
            await wait(1000);

            if(verifyData.length === 1) claimBTN.components[0].setLabel('Claim Role');
            claimBTN.components[0].setURL(baseURL+`${default_OBJ.projectKey}/`+verifyData.id);
            interaction.editReply({components: [claimBTN]});
            //shoutOut(interaction,user.id) // Create Event to add roles after after claiming it on webApp
        }
    }
}