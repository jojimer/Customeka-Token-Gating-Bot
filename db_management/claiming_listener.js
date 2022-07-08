const { updateUserAccount } = require(appRoot+'/db_management/control');
const { onSnapshot, collection, query, orderBy, where } = require('firebase/firestore');

module.exports = {
    snapShot: (client,announceTo,directory,nftData) => {
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
                
                let content = `“<@${u.id}> ${nftData.welcome}”\n`;
                let role,roleObj;

                const guild = client.guilds.cache.get(nftData.guild_id);
                guild.members.search({query: u.username, limit: 15, cache: false}).then(r => {
                    r.map(async gm => {
                        if(gm.user.id === u.id){
                            await u.roles.map(r => {
                                role = `<@&${r.role_id}> `;
                                content += role;
                                roleObj = guild.roles.cache.get(r.role_id);
                                gm.roles.add(roleObj);
                            })

                            client.channels.cache.get(announceTo).send({content: content});
                            updateUserAccount(fireBaseDB,u.id,{verified:"claimed"},directory);
                        }
                    })
                })																				
            })
        }, null, (firestoreError) => { if(firestoreError.code) this.snapShot(client,announceTo,directory,nftData); }) // End of snapshot
    }
}