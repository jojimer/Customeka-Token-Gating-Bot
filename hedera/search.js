const { validateAccountID, checkAccountNFTs, nextNFT, checkAccountBadges } = require('./request');

module.exports = {
    searchAccount: async (account_id,callback) => {
        const request = validateAccountID(account_id);
        request.then(async result => {
            const data = result.data;
            const validated = (typeof data.account == "string") ? true : false;
            await callback(validated);
        }).catch(async err => {
            console.log("Invalid wallet ID",err)
            await callback(false);
        })
    },
    searchNFTs: async (account_id, token_id, callback) => {
        const userNFTs = checkAccountNFTs(account_id,token_id);
        const res = {};
        let next,totalDoodles = 0;

        const collectNFT = (nft) => {
            const serial_number = nft.serial_number;
            const dataString = `{
                "token_id": "${token_id}",
                "serial_number": ${serial_number}
            }`;
            const obj = JSON.parse(dataString);
            res[`${token_id}`][`${serial_number}`] = obj;
        };        

        userNFTs.then(async result => {
            const data = result.data;
            next = data.links.next;

            if(data.nfts.length == 0){
                await callback({
                    total: totalDoodles,
                    nft: res,
                });
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
            await callback({
                total: totalDoodles,
                nft: res,
            });     
        })
    },
    searchBadges: async (account_id, badge, key, callback) => {
        const token_id = badge[0];
        const badge_pool_reward = badge[1];
        const serial_numbMin = (badge.length == 2) ? 1 : badge[2][0];
        const serial_numbMax = (badge.length == 2) ? 100 : badge[2][1];
        
        const res = {};
        let totalBadges = 0;
        const userNFTs = checkAccountBadges(account_id,token_id);

        userNFTs.then(async result => {
            const data = result.data.nfts;
            if(data.length == 0){
                callback({
                    total: totalBadges,
                    badges: res,
                });
                return;
            };

            res[`${key}`] = {};
            await data.map(nft => {
                const token_id = nft.token_id;
                const serial_number = nft.serial_number;

                if((serial_number >= serial_numbMax || serial_number < serial_numbMin) && badge.length == 3) return;
                
                const dataString = `{
                    "token_id": "${token_id}",
                    "serial_number": ${serial_number},
                    "reward_pool": ${badge_pool_reward},
                    "share_value": "100%"
                }`;
                const obj = JSON.parse(dataString);
                res[`${key}`][`${serial_number}`] = obj;
            })

            totalBadges += Object.keys(res[`${key}`]).length;
            res[`${key}`].token_id = token_id;

            await callback({
                total: totalBadges,
                badges: res,
            }); 
        }).catch(err => {
            console.log(err)
        })
    }
}