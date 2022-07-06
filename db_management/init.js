const { collection, doc, getDoc } = require('firebase/firestore');

module.exports = {
    validate: async (db) => {     
        const settings = doc(db, 'NFT_PROJECTS', 'doodle_verse_G45m12B'); // Reference
        const result = await getDoc(settings); // Get Single Document
        if(result.exists()) return result.data();
    },
    getAllUsers: async (db) => {
        let usersDB = collection(db, 'users');
    }
}