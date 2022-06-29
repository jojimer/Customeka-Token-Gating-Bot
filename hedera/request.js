const mainnet = "https://mainnet-public.mirrornode.hedera.com";
const testnet = "https://testnet.mirrornode.hedera.com";
const axios = require("axios");
const { connectFirestoreEmulator } = require('firebase/firestore');

// Query
const limit = 100;
const order = 'asc';

// Serial Numbers Query Operators
const ltSerialNumber = "&serialnumber=lte:86";
const gtSerialNumber = "&serialnumber=gt:200";

// URLs
// const sameTokenNFTs = mainnet+`/api/v1/tokens/${tokenID}/nfts?order=${order}&limit=${limit}`;

module.exports = {
    // getNFTs: () => {
    //     return {token_id: tokenID, doc: docName, result: axios.get(sameTokenNFTs+ltSerialNumber)};
    // },
    validateAccountID: (account_id) => {
        const account = mainnet+`/api/v1/accounts/${account_id}`;
        return axios.get(account);
    },
    checkAccountNFTs: (account_id,token_id) => {
        const NFTs = mainnet+`/api/v1/accounts/${account_id}/nfts?limit=100&token.id=${token_id}`;
        return axios.get(NFTs);

    },
    nextNFT: (next) => {
        return axios.get(mainnet+next);
    },
    checkAccountBadges: (account_id,token_id) => {
        const NFTs = mainnet+`/api/v1/accounts/${account_id}/nfts?limit=100&token.id=${token_id}`;
        return axios.get(NFTs);
    }
}