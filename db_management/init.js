const { collection, doc, getDoc } = require('firebase/firestore');

module.exports = {
    Init: async (directory) => {
        const settings = doc(fireBaseDB, 'NFT_PROJECTS', directory); // Reference
        const result = await getDoc(settings); // Get Single Document
        if(result.exists()){
            const r = result.data();
            const connectChannel = r.guild.channels.connect;
            const announcementChannel = r.guild.channels.announcement;
            const pause = r.pause;

            return { 
                pause: pause, 
                channels: {
                    connect: connectChannel,
                    announcement: announcementChannel
                },
                greetings: r.greetings,
                guild_id: r.id,
                connect_image: r.connect_image,
                announcement_message: r.announcement_message
            }
        }
    },
}