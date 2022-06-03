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
    checkAccountNFTs: (account_id,token_id) => {
        checkAccountNFTs = mainnet+`/api/v1/accounts/${account_id}/nfts?limit=100&token.id=${token_id}`;
        return axios.get(checkAccountNFTs);

    },
    nextNFT: (next) => {
        return axios.get(mainnet+next);
    },
    checkAccountBadges: (account_id,token_id) => {
        checkAccountNFTs = mainnet+`/api/v1/accounts/${account_id}/nfts?limit=100&token.id=${token_id}`;
        return axios.get(checkAccountNFTs);
    }
}

// Badges
// const eternals = "0.0.602976";
// const fusions = "0.0.858211";
// const arc0 = ["0.0.587188","0.0.587177"];
// const arc1 = [
//     "0.0.590671",
//     "0.0.590742", 
//     "0.0.590692", 
//     "0.0.590710", 
//     "0.0.590673", 
//     "0.0.590738", 
//     "0.0.590684", 
//     "0.0.590695"
// ];
// const arc2 = "0.0.833886";
// const SpecialEdition = "0.0.806716";
// const LSVKematianDoodles = "0.0.659672";
// const LSVJesterDoodles = "0.0.659673";
// const LSHKjellDoodles = "0.0.638446";
// const LSHCrawfordDoodles = "0.0.638420";
// const BlackCrawford = "0.0.655428";
// const BlackZDoodles = "0.0.636220";
// const DoodlePunks = "0.0.645282";
// const MetaFrost = "0.0.614043";
// const Sweetizens = [
//     "0.0.602992", 
//     "0.0.603016", 
//     "0.0.603025", 
//     "0.0.603038",
//     "0.0.603051"
// ];
// const DoodleShadyz = "0.0.797653";
// const RaffleTickets = "0.0.858134";