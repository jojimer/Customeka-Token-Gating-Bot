const { collection, doc, getDocs, setDoc, query, where, updateDoc } = require('firebase/firestore');

module.exports = {
    addUser: (db,data) => {
        const docRef = doc(db,directive+'members',data.id);
        setDoc(docRef,data);
    },
    addHolderData: (db,data) => {
        const docRef = doc(db,directive+'holders',data.id);
        setDoc(docRef,data);
    },
    addVerificationLink: (db,data) => {
        const docRef = doc(db,directive+'verification_key',data.id);
        setDoc(docRef,data);
    },
    isAccountExist: (db,account_id,callback) => {
        const colRef = collection(db,directive+'members');
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
        const docRef = doc(db,directive+'members',discord_id);
        updateDoc(docRef,data);
    }
}