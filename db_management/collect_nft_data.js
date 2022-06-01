const { firebaseConfig } = require('../firebase');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getNFTs } = require('../hedera/request');
const { collection, getDocs, getDoc, deleteDoc, doc, setDoc, updateDoc, onSnapshot, query, where, orderBy } = require('firebase/firestore');

// Firebase Config
initializeApp(firebaseConfig);

// inittialize firestore
const db = getFirestore();

getNFTs().then( async res => {
    const NFTs = res.data.nfts;
    const data = {};
    const docRef = doc(db,'nfts','RaffleTickets');

    await NFTs.map(nft => {
        const account_id = nft.account_id;
        const token_id = nft.token_id;
        const serial_number = nft.serial_number;

        //if(serial_number <= 25) return;
        
        const dataString = `{
            "token_id": "${token_id}",
            "account_id": "${account_id}",
            "serial_number": ${serial_number}
        }`;
        const obj = JSON.parse(dataString);
        // data[`${token_id+`_sn`+serial_number}`] = obj;
        data[`${serial_number}`] = obj;
    })

    setDoc(docRef,data,{merge: true});
}).catch(err => {
    console.log(err);
});

// #Save NFTs with Single TokenID on a category
// getNFTs().then( async res => {
//     const NFTs = res.data.nfts;
//     const data = {};
//     const docRef = doc(db,'badges','fusions');

//     await NFTs.map(nft => {
//         const account_id = nft.account_id;
//         const token_id = nft.token_id;
//         const serial_number = nft.serial_number;

//         if(serial_number <= 25) return;
        
//         const dataString = `{
//             "token_id": "${token_id}",
//             "account_id": "${account_id}",
//             "serial_number": ${serial_number}
//         }`;
//         const obj = JSON.parse(dataString);
//         data[`${serial_number}`] = obj;
//     })

//     setDoc(docRef,data);
// }).catch(err => {
//     console.log(err);
// });