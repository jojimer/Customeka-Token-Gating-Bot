const { doc, getDoc } = require('firebase/firestore');

module.exports = {
    Init: async (directory) => {
        const settings = doc(fireBaseDB, 'NFT_PROJECTS', directory); // Reference
        const result = await getDoc(settings); // Get Single Document
        if(result.exists()){
            const r = result.data();

            return { 
                pause: r.pause, 
                channels: r.guild.channels,
                greetings: r.greetings,
                guild_id: r.id,
                connect_image: r.connect_image,
                announcement_message: r.announcement_message
            }
        }
    },
}