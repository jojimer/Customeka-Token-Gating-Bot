const { collection, doc, getDocs, setDoc, query, where, updateDoc } = require('firebase/firestore');

module.exports = {
    addUser: (db,data,directory) => {
        const docRef = doc(db,directory+'/members',data.id);
        setDoc(docRef,data);
    },
    addHolderData: (db,data,directory) => {
        const docRef = doc(db,directory+'/holders',data.id);
        setDoc(docRef,data);
    },
    addVerificationLink: (db,data,directory) => {
        const docRef = doc(db,directory+'/verification_key',data.id);
        setDoc(docRef,data);
    },
    isAccountExist: (db,account_id,directory,callback) => {
        const colRef = collection(db,directory+'/members');
        const q = query(colRef, where("walletID", "==", account_id));
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
    updateUserAccount: (db,discord_id,data,directory) => {
        const docRef = doc(db,directory+'/members',discord_id);
        updateDoc(docRef,data);
    }
}