const { validateAccountID, checkAccountNFTs, nextNFT, checkAccountBadges } = require('./request');

module.exports = {
    searchAccount: async (account_id,callback) => {
        const request = validateAccountID(account_id);
        request.then(async result => {
            const data = result.data;
            const validated = (typeof data.account == "string") ? true : false;
            await callback(validated);
        }).catch(async err => {
            console.log("Invalid wallet ID",err.response.status)
            await callback(false);
        })
    },
    searchNFTs: (account_id, token_id, callback) => {
        const userNFTs = checkAccountNFTs(account_id,token_id);
        const res = {};
        let next,totalDoodles = 0;

        const collectNFT = (nft) => {
            const serial_number = nft.serial_number;
            const dataString = `{
                "token_id": "${token_id}",
                "account_id": "${account_id}",
                "serial_number": ${serial_number}
            }`;
            const obj = JSON.parse(dataString);
            res[`${token_id}`][`${serial_number}`] = obj;
        };        

        userNFTs.then(async result => {
            const data = result.data;
            next = data.links.next;

            if(data.nfts.length == 0){
                await callback(totalDoodles);
                return;
            }

            res[`${token_id}`] = {}
            await data.nfts.map(nft => {
                collectNFT(nft)
            })

            // Return if null
            if(next) {
                await nextNFT(next).then(async result => {
                    const data = result.data;
                    next = data.links.next;

                    await data.nfts.map(nft => {
                        collectNFT(nft)
                    })

                    console.log(res)

                    // Return if null
                    if(next){
                        await nextNFT(next).then(async result => {
                            const data = result.data;
                            next = data.links.next;
                            await data.nfts.map(nft => {
                                collectNFT(nft)
                            })                            
                        })
                    }
                })        
            };

            //console.log(Object.keys(res[`${token_id}`]).length,res);
            totalDoodles += Object.keys(res[`${token_id}`]).length;
            await callback(totalDoodles);     
        })
    },
    searchBadges: async (account_id, badge, callback) => {
        const token_id = badge[0];
        const serial_numbMin = (badge.length == 1) ? 1 : badge[1][0];
        const serial_numbMax = (badge.length == 1) ? 100 : badge[1][1];
        
        let res = {};
        let totalBadges = 0;
        const userNFTs = checkAccountBadges(account_id,token_id);

        userNFTs.then(async result => {
            const data = result.data.nfts;
            if(data.length == 0){
                callback(totalBadges);
                return;
            };

            res[`${token_id}`] = {};
            await data.map(nft => {
                const account_id = nft.account_id;
                const token_id = nft.token_id;
                const serial_number = nft.serial_number;

                if((serial_number >= serial_numbMax || serial_number < serial_numbMin) && badge.length == 2) return;
                
                const dataString = `{
                    "token_id": "${token_id}",
                    "account_id": "${account_id}",
                    "serial_number": ${serial_number}
                }`;
                const obj = JSON.parse(dataString);
                res[`${token_id}`][`${serial_number}`] = obj;
            })

            totalBadges += Object.keys(res[`${token_id}`]).length;
            await callback(totalBadges);
        }).catch(err => {
            console.log(err)
        })
    }
}