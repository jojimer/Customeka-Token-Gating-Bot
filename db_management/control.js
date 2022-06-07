const { collection, addDoc, doc, getDoc, setDoc } = require('firebase/firestore');

module.exports = {
    addUser: (db,data) => {
        const docRef = doc(db,'users',data.id);
        setDoc(docRef,data);
    },
    isUserExist: (db,data) => {
        
    }
}