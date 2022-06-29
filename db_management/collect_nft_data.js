const { firebaseConfig } = require('../firebase');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getNFTs } = require('../hedera/request');
const { collection, getDocs, getDoc, deleteDoc, doc, setDoc, updateDoc, onSnapshot, query, where, orderBy } = require('firebase/firestore');

// Firebase Config
initializeApp(firebaseConfig);

// inittialize firestore
const db = getFirestore();
// const nfts = doc(db,'nfts','BlackCrawford');
// // #Queries
// const q = query(nfts, where(`{i}.account_id`, "==", "0.0.531372"), orderBy("serial_number", "desc"));
// onSnapshot(q, (snapshot) => {
// 	let userData =  [];
// 	snapshot.docs.forEach((doc) => {
// 		userData.push({ ...doc.data(), id: doc.id });
// 	});
// 	console.log(userData);
// })

const NFTs = getNFTs();
const tokenID = NFTs.token_id;
const docName = NFTs.doc;

NFTs.result.then(async res => {
    const NFTs = res.data.nfts;
    const data = {[`${tokenID}`]: {}};
    const docRef = doc(db,'badges',docName);

    await NFTs.map(nft => {
        const account_id = nft.account_id;
        const token_id = nft.token_id;
        const serial_number = nft.serial_number;

        if(serial_number <= 25) return;
        
        const dataString = `{
            "token_id": "${token_id}",
            "account_id": "${account_id}",
            "serial_number": ${serial_number}
        }`;
        const obj = JSON.parse(dataString);
        // data[`${token_id+`_sn`+serial_number}`] = obj;
        data[`${tokenID}`][`${serial_number}`] = obj;
    })

    //console.log(data)
    if(Object.keys(data[`${tokenID}`]).length === 0) return;
    setDoc(docRef,data,{merge: true});
}).catch(err => {
    console.log(err);
});