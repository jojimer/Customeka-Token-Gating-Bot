const { updateUserAccount, getAllAcount } = require('./control');
const wait = require('node:timers/promises').setTimeout;
const { performance } = require('perf_hooks');
const cron = require('node-cron');
const getRandomInt = (min,max) => {
    return 10*(Math.random() * (max - min) + min);
  }

const checkForNewRoles = async (u,newRole,removeRole,client,guild,member,nftData) => {
    let oldRoles = u.roles;
    let roles = false;
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
        console.log(u.username+ ' New Roles Acquired', newRole);

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
        
        console.log('Removed '+u.username+' Roles',removeRole);

        oldRoles.filter(role => {
            const count = removeRole.filter(r => r.role_id === role.role_id).length;           
            return count > 0;
        });

        roles = oldRoles;
    }

    await wait(1000 * 35)
    //await client.channels.cache.get(nftData.channels.announcement).send({content: content});
    return roles;
}

module.exports = {
    startMonitoring: async (client) => {
        const { monitorWallet, getRoles } = client.nft.get('process');
        const nftData =  client.nft.get('data');
        const projectDirectory = 'NFT_PROJECTS/'+nftData.directory+'/';
        let currentRoles,additionalRole,removableRole,guild;

        cron.schedule(' */6 * * * *', async () => {
            console.log('Monitoring NFT holders every 6 minutes');
            guild = await client.guilds.fetch(nftData.guild_id);          
            getAllAcount(projectDirectory, async (result) => {
                if(result){
                    await result.map(async u => {
                        const startTime = performance.now();                                             
                        await guild.members.fetch(u.id).then(async member => {
                            currentRoles = [];
                            await getRoles(r => r.map(v => {
                                member.roles.member._roles.map(id => {
                                    if(id == v.role_id) 
                                      currentRoles.push({name: v.roleName, role_id: v.role_id});
                                })                                    
                            }));

                            await wait(1000 * getRandomInt(1,22))

                            // Get role data from mirror-node
                            await monitorWallet({id:u.id, username: u.username, wallet: u.walletID},(async r => {
                                // Roles Changes
                                additionalRole = r.roles.filter(v => !currentRoles.some(c => v.role_id == c.role_id));
                                removableRole = currentRoles.filter(c => !r.roles.some(v => v.role_id == c.role_id));
                                // console.log(currentRoles,additionalRole,removableRole);

                                if(additionalRole.length > 0 || removableRole.length > 0){
                                    // Check New Roles if change happen and add new role to discord                                    
                                    await checkForNewRoles(u,additionalRole,removableRole,client,guild,member,nftData).then(newRoles => {
                                        if(typeof newRoles === 'object'){
                                            //console.log(r)
                                            // Update Roles in Firestore Database
                                            updateUserAccount(u.id,{roles: r.roles},projectDirectory+'members');
                                            // Update NFT record in Firestore Database
                                            updateUserAccount(u.id,{nfts: r.holding.nfts, badges: r.holding.badges},projectDirectory+'holders');
                                        }
                                    })
                                }
                            }));
                        }).catch(err => {
                            console.log(err)
                        });
                        
                        const endTime = performance.now();

                        console.log(`Monitoring ${u.username} took ${(endTime - startTime) / 1000} seconds`);
                    })
                }
            });
        });        
    }
}