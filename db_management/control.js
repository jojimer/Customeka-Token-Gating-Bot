const { collection, doc, getDocs, setDoc, query, where, updateDoc } = require('firebase/firestore');

module.exports = {
    addUser: (db,data) => {
        const docRef = doc(db,'users',data.id);
        setDoc(docRef,data);
    },
    addHolderData: (db,data) => {
        const docRef = doc(db,'holders',data.id);
        setDoc(docRef,data);
    },
    addVerificationLink: (db,data) => {
        const docRef = doc(db,'verification_key',data.id);
        setDoc(docRef,data);
    },
    isAccountExist: (db,account_id,callback) => {
        const colRef = collection(db,'users');
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
    updateUserAccount: (db,discord_id,data) => {
        const docRef = doc(db,'users',discord_id);
        updateDoc(docRef,data);
    }
}