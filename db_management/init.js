const { collection, doc, getDoc } = require('firebase/firestore');

module.exports = {
    validate: async (db) => {     
        const settings = doc(db, 'NFT_PROJECTS', 'serpent_project_7H97ERE'); // Reference
        const result = await getDoc(settings); // Get Single Document
        if(result.exists()) return result.data();
    },
    getAllUsers: async (db) => {
        let usersDB = collection(db, 'users');
    }
}