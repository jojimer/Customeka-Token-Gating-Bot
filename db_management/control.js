const { collection, doc, getDocs, setDoc, query, where, updateDoc } = require('firebase/firestore');

module.exports = {
    addUser: (data,directory) => {
        const docRef = doc(fireBaseDB,directory+'members',data.id);
        setDoc(docRef,data);
    },
    addHolderData: (data,directory) => {
        const docRef = doc(fireBaseDB,directory+'holders',data.id);
        setDoc(docRef,data);
    },
    addVerificationLink: (data,directory) => {
        const docRef = doc(fireBaseDB,directory+'verification_key',data.id);
        setDoc(docRef,data);
    },
    isAccountExist: (discord_id,directory,callback) => {
        const colRef = collection(fireBaseDB,directory+'members');
        const q = query(colRef, where("id", "==", discord_id));
        getDocs(q).then(snapshot => {
            let userData =  [];
            snapshot.docs.forEach((doc) => {
                userData.push({ ...doc.data(), id: doc.id });
            });

            // Set false if no record of wallet ID in the firebase
            let result = (userData.length) ? userData : false;
            callback(result);
        });
    },
    updateUserAccount: (discord_id,data,directory) => {
        const docRef = doc(fireBaseDB,directory,discord_id);
        return updateDoc(docRef,data);
    },
    getAllAcount: (directory,callback) => {
        const colRef = collection(fireBaseDB,directory+'members');
        const q = query(colRef, where("verified", "==", 'claimed'));
        getDocs(q).then(snapshot => {
            let userData =  [];
            snapshot.docs.forEach((doc) => {
                userData.push({ ...doc.data(), id: doc.id });
            });

            // Set false if no record of wallet ID in the firebase
            let result = (userData.length) ? userData : false;
            callback(result);
        })
    }
}