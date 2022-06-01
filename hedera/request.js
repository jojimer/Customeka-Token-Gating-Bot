const mainnet = "https://mainnet-public.mirrornode.hedera.com/";
const testnet = "https://testnet.mirrornode.hedera.com/";

const { async } = require("@firebase/util");
const axios = require("axios");

// Query
const limit = 100;
const order = 'asc';

// Serial Numbers Query Operators
const ltSerialNumber = "&serialnumber=lte:86";
const gtSerialNumber = "&serialnumber=gt:200";

// Badges
const eternals = "0.0.602976";
const otherBadges = "0.0.858211";
const arc0AstroBaird = "0.0.587177";
const arc0CinnamonDreamer  = "0.0.587188";
const etherion = "0.0.590671";
const hashRangers = [
    "0.0.590742", 
    "0.0.590692", 
    "0.0.590710", 
    "0.0.590673", 
    "0.0.590738", 
    "0.0.590684", 
    "0.0.590695"
];
const arc2DoodleSerial = "0.0.833886";
const specialEditionHolders = "0.0.806716";
const LSVKematianDoodles = "0.0.659672";
const LSVJesterDoodles = "0.0.659673";
const LSHKjellDoodles = "0.0.638446";
const LSHCrawfordDoodles = "0.0.638420";
const BlackCrawford = "0.0.655428";
const BlackZDoodles = "0.0.636220";
const DoodlePunks = "0.0.645282";
const MetaFrost = "0.0.614043";
const Sweetizens = [
    "0.0.602992", 
    "0.0.603016", 
    "0.0.603025", 
    "0.0.603038",
    "0.0.603051"
];
const DoodleShadyz = "0.0.797653";
const RaffleTickets = "0.0.858134";


// URLs
const sameTokenNFTs = mainnet+`api/v1/tokens/${RaffleTickets}/nfts?order=${order}&limit=${limit}`;

module.exports = {
    getNFTs: () => {
        return axios.get(sameTokenNFTs+gtSerialNumber);
    }
}