const { collection, addDoc, doc, getDocs, setDoc, query, where } = require('firebase/firestore');

module.exports = {
    addUser: (db,data) => {
        const docRef = doc(db,'users',data.id);
        setDoc(docRef,data);
    },
    isUserExist: (db,account_id,callback) => {
        const colRef = collection(db,'users');
        const q = query(colRef, where("walletID", "==", account_id));
        getDocs(q).then(snapshot => {
            let userData =  [];
            snapshot.docs.forEach((doc) => {
                userData.push({ ...doc.data(), id: doc.id });
            });
            let result = (userData.length) ? userData : false;
            callback(result);
        });
    }
}