const { collection, doc, getDoc } = require('firebase/firestore');

module.exports = {
    Init: async (db,directory) => {
        const settings = doc(db, 'NFT_PROJECTS', directory); // Reference
        const result = await getDoc(settings); // Get Single Document
        if(result.exists()){
            const r = result.data();
            const connectChannel = r.guild.channels.connect;
            const announcementChannel = r.guild.channels.announcement;
            const pause = r.pause;

            return { pause: pause, channels: {
                connect: connectChannel,
                announcement: announcementChannel
            } }
        }
    },
    GetAllUsers: async (db) => {
        let usersDB = collection(db, 'users');
    },
}