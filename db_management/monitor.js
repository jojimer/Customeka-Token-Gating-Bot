const { updateUserAccount } = require('./control');
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('perf_hooks');
const cron = require('node-cron');

// Search User Files
const membersPath = path.join(appRoot,localDB);
const memberFiles = fs.readdirSync(membersPath).filter(file => file.endsWith('.json'));
const tokenCounter = async (ArrayKey,Record) => {
    let serialNumbers = [];
    await ArrayKey.map(v => { serialNumbers.push(...Object.keys(Record[v])); });
    return serialNumbers;
}

const checkForChanges = async (a,b) => {
    let x = false;
        if(a.length > b.length) x = true;
        if(b.length > a.length) x = true;
        if(a.filter(x => !b.includes(x)).length > 0) x = true;
        if(b.filter(x => !a.includes(x)).length > 0) x = true;
    return x;
}

const updateLocalDB = (id,newData) => {
    fs.writeFile(appRoot+localDB+id+".json", JSON.stringify(newData), 'utf8', (err) => {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        
        console.log(newData.username+" Local Record is updated");
    });
}

const checkForNewRoles = async (u,r,client,nftData) => {
    let roles;
    if(u.roles.length < r.roles.length){
        const newRole = r.roles.filter(role => {
            const count = u.roles.filter(r => r.name === role.name).length;
            return count === 0;
        });
        console.log(newRole);
        u.roles.push(...newRole);
        let content = `“<@${u.id}> Alert! New Role Acquired”\n`;
        let role,roleObj;
        const guild = client.guilds.cache.get(nftData.guild_id);
        await guild.members.fetch(u.id).then(async r => {
           
            if(r.user.id === u.id){
                // Add Roles to user 
                await newRole.map(rRole => {
                    role = `<@&${rRole.role_id}> `;
                    content += role;
                    roleObj = guild.roles.cache.get(rRole.role_id);
                    r.roles.add(roleObj);
                })
            }
            
            client.channels.cache.get(nftData.channels.announcement).send({content: content});
            console.log('New Roles Acquired');
            roles = u.roles;
        }).catch(err => {
            console.log(err);
            return false;
        })
    }else if(u.roles.length > r.roles.length){
        const removeRole = u.roles.filter(role => {
            const count = r.roles.filter(r => r.name === role.name).length;
            return count === 0;
        });
        
        let content = `“<@${u.id}> Alert! `;
        let role,roleObj;
        const guild = client.guilds.cache.get(nftData.guild_id);
        await guild.members.fetch(u.id).then(async rf => {
           
            if(rf.user.id === u.id){
                // Remove Roles to user 
                await removeRole.map(rRole => {
                    role = `<@&${rRole.role_id}> `;
                    content += role;
                    roleObj = guild.roles.cache.get(rRole.role_id);
                    rf.roles.remove(roleObj);
                })
            }

            content += (removeRole.length > 1) ? ' Roles' : 'Role';
            content += ' has been removed due to disqualification of NFT holdings';
            
            client.channels.cache.get(nftData.channels.announcement).send({content: content});
            console.log('Removed '+u.username+' Roles',removeRole);
            u.roles = u.roles.filter(role => {
                const count = r.roles.filter(r => r.name === role.name).length;                
                return count > 0;
            });
            roles = u.roles;
        }).catch(err => {
            console.log(err);
            return;
        })
    }else{
        roles = false;
    }

    return roles;
}

module.exports = {
    startMonitoring: async (client) => {
        const { monitorWallet } = client.nft.get('process');
        const nftData =  client.nft.get('data');
        const projectDirectory = 'NFT_PROJECTS/'+nftData.directory+'/';

        cron.schedule('*/6 * * * *', () => {
            console.log('running a task every 5 minutes');
            memberFiles.map(async file => {
                const u = require(`${membersPath}/${file}`);
                const startTime = performance.now();
                await monitorWallet({id:u.id, username: u.username, wallet: u.walletID},(async r => {

                    const holdingsToken = await tokenCounter(Object.keys(r.holding.nfts),r.holding.nfts);
                    const recordedToken = await tokenCounter(Object.keys(u.holding.nfts),u.holding.nfts);
                    const nftChanged = await checkForChanges(holdingsToken,recordedToken);
                    const badgesChanged = (
                        Object.keys(u.holding.badges).length > Object.keys(r.holding.badges).length
                        || Object.keys(u.holding.badges).length < Object.keys(r.holding.badges).length
                    ) ? true : false;

                    // New Record Found
                    if(nftChanged || badgesChanged){                  
                        // Update NFT record in Firestore Database
                        updateUserAccount(u.id,{nfts: r.holding.nfts, badges: r.holding.badges},projectDirectory+'holders');
                        u.holding = r.holding;
                        
                        // Check New Roles if change happen and add new role to discord
                        checkForNewRoles(u,r,client,nftData).then(newRoles => {
                            if(typeof newRoles === 'object'){
                                u.roles = newRoles;
                                // Update Roles in Firestore Database
                                updateUserAccount(u.id,{roles: u.roles},projectDirectory+'members');
                            }

                            // Update Local Data
                            updateLocalDB(u.id,u);
                        })
                    }  
                }));
                const endTime = performance.now();
                console.log(`Call to do something took ${(endTime - startTime) / 1000} seconds`);
            }); // End of mapping
        });        
    }
}