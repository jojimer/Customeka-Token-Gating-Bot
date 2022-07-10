const { updateUserAccount } = require(appRoot+'/db_management/control');
const { onSnapshot, collection, query, orderBy, where, getDoc, doc } = require('firebase/firestore');
const fs = require('node:fs');

const loopDelete = (data,array) => {
    array.map(v =>  delete data[v]);
    return data;
}

module.exports = {
    snapShotRoleClaimers: (client,announceTo,directory,nftData) => {
        // Collection Reference
        const colRef = collection(fireBaseDB, directory+'members');

        //queries
        const q = query(colRef, where("verified", "==", "claiming"),orderBy('verification_time'));

        // realtime collection data
        onSnapshot(q, (snapshot) => {
            let users = []
            snapshot.docs.forEach(doc => {
                users.push({ ...doc.data(), id: doc.id })
            })

            users.map(async u => {
                
                let content = `“<@${u.id}> (`;
                let role,roleObj;

                const guild = client.guilds.cache.get(nftData.guild_id);
                guild.members.search({query: u.username, limit: 15, cache: false}).then(r => {
                    r.map(async gm => {
                        let i = 0;
                        if(gm.user.id === u.id){
                            // Add Roles to user 
                            await u.roles.map(r => {
                                role = `<@&${r.role_id}> `;
                                content += role;
                                roleObj = guild.roles.cache.get(r.role_id);
                                gm.roles.add(roleObj);
                            })
                            
                            content += `) \n ${nftData.welcome}”`;
                            
                            //Update Firebase Members document
                            updateUserAccount(u.id,{verified:"claimed"},directory+'members').then(() => {
                                getDoc(doc(fireBaseDB,directory+'holders',u.id)).then(r => {
                                    if(r.exists()){
                                        const newData = loopDelete(u,["holders_data","verification_key","verification_time","verified","vip"]);
                                        const holder = r.data();
                                        newData.holding = holder;
                                        // Save Verified User to databased
                                        const jsonContent = JSON.stringify(newData);
                                        fs.writeFile(appRoot+localDB+u.id+".json", jsonContent, 'utf8', (err) => {
                                            if (err) {
                                                console.log("An error occured while writing JSON Object to File.");
                                                return console.log(err);
                                            }
                                            
                                            console.log("verified members JSON file has been saved.");
                                            client.channels.cache.get(announceTo).send({content: content});
                                        });
                                    }
                                })                                
                            });                   
                        }
                    })
                })																				
            })
        }, null, (firestoreError) => { if(firestoreError.code) this.snapShotRoleClaimers(client,announceTo,directory,nftData); }) // End of snapshot
    }
}