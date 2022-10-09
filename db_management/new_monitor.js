const { updateUserAccount, getAllAcount } = require('./control');
const wait = require('node:timers/promises').setTimeout;
const { performance } = require('perf_hooks');
const cron = require('node-cron');
const getRandomInt = (min,max) => {
    return 10*(Math.random() * (max - min) + min);
  }

const checkForNewRoles = async (u,newRole,removeRole,guild,member) => {
    let roles = false;
    const oldRoles = u.roles;
    let content = '';
    
    if(member.user.id === u.id && newRole.length > 0){        
        let nc_role,nc_roleObj;
        content += `“<@${u.id}> Alert! New Role Acquired”\n`;

        // Add Roles to user 
        await newRole.map(nRole => {
            nc_role = `<@&${nRole.role_id}> `;
            content += nc_role;
            nc_roleObj = guild.roles.cache.get(nRole.role_id);
            member.roles.add(nc_roleObj);
        })
        console.log(u.name+ ' New Roles Acquired', newRole);

        content += '\n\n';
        oldRoles.push(...newRole);
        roles = oldRoles;
    }

    await wait(1000 * 35)

    if(member.user.id === u.id && removeRole.length > 0){
        content += `“<@${u.id}> Alert! `;
        let rr_role,rr_roleObj;

        // Remove Roles to user 
        await removeRole.map(rRole => {
            rr_role = `<@&${rRole.role_id}> `;
            content += rr_role;
            rr_roleObj = guild.roles.cache.get(rRole.role_id);
            member.roles.remove(rr_roleObj);
        })

        content += (removeRole.length > 1) ? ' Roles' : 'Role';
        content += ' has been removed due to disqualification of NFT holdings';
        
        console.log('Removed '+u.name+' Roles',removeRole);

        oldRoles.filter(role => {
            const count = removeRole.filter(r => r.role_id == role.role_id).length;           
            return count > 0;
        });

        roles = oldRoles;
    }
    await wait(1000 * 35);       
    //await client.channels.cache.get(nftData.channels.announcement).send({content: content});
    return roles;
}

module.exports = {
    startMonitoring: async (client) => {
        const { monitorWallet, getRoles } = client.nft.get('process');
        const nftData =  client.nft.get('data');
        const projectDirectory = 'NFT_PROJECTS/'+nftData.directory+'/';
        const guild = await client.guilds.cache.get(nftData.guild_id);               
        let currentRoles,additionalRole,removableRole,roles;

        cron.schedule(' */0.1 * * * *', async () => {
            const users = {};
            console.log(Object.keys(pastRecord).length,pastRecord);
            console.log('Monitoring NFT holders every 6 minutes');          
            await getAllAcount(projectDirectory, async (result) => await result.map(u => {
                guild.members.fetch(u.id);
                users[u.id] = {
                    id: u.id,
                    name: u.username,
                    roles: u.roles,
                    walletID: u.walletID,
                    memberRoles: []
                }
            })).then(async () => {
                Object.keys(users).map(async id => {
                    const member = await guild.members.cache.get(id);
                    const startTime = performance.now();
                    const user = users[member.user.id];
                    currentRoles = [];
                    await getRoles(r => r.map(v => {
                        roles = (Object.keys(pastRecord).length !== 0) ? pastRecord[user.id].memberRoles : member._roles;                    
                        roles.map(id => {
                            if(id == v.role_id) currentRoles.push({name: v.roleName, role_id: v.role_id});
                        })       
                    }));
    
                    if(!pastRecord[user.id]) pastRecord[user.id] = { memberRoles: [] };
                    // if((Object.keys(pastRecord).length !== 0)) console.log(user.name,currentRoles,pastRecord[user.id].memberRoles,member._roles);

                    await wait(1000 * getRandomInt(1,18))
    
                    // Get role data from mirror-node
                    await monitorWallet({id:user.id, username: user.name, wallet: user.walletID},(async r => {
                        // Roles Changes
                        additionalRole = r.roles.filter(v => !currentRoles.some(c => v.role_id == c.role_id));
                        removableRole = currentRoles.filter(c => !r.roles.some(v => v.role_id == c.role_id));
                        // console.log(user.name,currentRoles,additionalRole,removableRole);
    
                        if(additionalRole.length > 0 || removableRole.length > 0){
                            // Check New Roles if change happen and add new role to discord                                    
                            await checkForNewRoles(user,additionalRole,removableRole,guild,member).then(newRoles => {
                                if(typeof newRoles === 'object'){
                                    newRoles.map(role => user.memberRoles.push(role.role_id));
                                    pastRecord[user.id].memberRoles = user.memberRoles;
                                    //console.log(pastRecord[user.id]);
                                    // Update Roles in Firestore Database
                                    updateUserAccount(user.id,{roles: r.roles},projectDirectory+'members');
                                    // Update NFT record in Firestore Database
                                    updateUserAccount(user.id,{nfts: r.holding.nfts, badges: r.holding.badges},projectDirectory+'holders');
                                }else{
                                    currentRoles.map(role => user.memberRoles.push(role.role_id));
                                    pastRecord[user.id].memberRoles = user.memberRoles;
                                }
                            })
                        }
                    }));                       
                    const endTime = performance.now();
                    console.log(`Monitoring ${user.name} took ${(endTime - startTime) / 1000} seconds`);
                });
            })
        });        
    }
}