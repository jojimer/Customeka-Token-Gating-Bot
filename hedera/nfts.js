module.exports = {
    data: {
        Doodles: ["0.0.587188","0.0.587177","0.0.590671","0.0.590742","0.0.590692","0.0.590710","0.0.590673","0.0.590738","0.0.590684","0.0.590695","0.0.833886","0.0.806716","0.0.614043","0.0.602992","0.0.603016","0.0.603025","0.0.603038","0.0.603051"],
        DoodlePunks: ["0.0.645282"],
        DoodleShadyz: ["0.0.797653"],
        LazyDoodles: ["0.0.659672","0.0.659673","0.0.638446","0.0.638420","0.0.655428","0.0.636220"],
        RaffleTickets: ["0.0.858134"],
        Badges: {
            eternals: ["0.0.602976"],
            diamonds: ["0.0.858211",[1,2]], 
            golds: ["0.0.858211",[3,11]],
            silvers: ["0.0.858211",[12,25]],
            fusions: ["0.0.858211",[26,86]],
        },
        Roles: {
            arc0: { roleName: "Arc 0 Bearers", token_id: ["0.0.587177", "0.0.587188"]},
            arc1: { roleName: "Arc 1 Bearers", token_id: ["0.0.590742", "0.0.590692", "0.0.590710", "0.0.590673", "0.0.590738", "0.0.590684", "0.0.590695", "0.0.590671" ]},
            arc2: { roleName: "Arc 2 Bearers", token_id: ["0.0.833886"]},
            badgeHolder: { roleName: "Badge Holders", token_id: ["0.0.602976","0.0.858211"]},
            arcCollectors: { roleName: "Arc Collectors", token_id: ["0.0.602992","0.0.603016","0.0.603025","0.0.603038","0.0.603051","0.0.614043"]},
            specialEditions: { roleName: "Special Edition Holders", token_id: ["0.0.806716"]},
            lazyDoodles: { roleName: "LazyDoodles", token_id: ["0.0.659672","0.0.659673","0.0.638446","0.0.638420","0.0.655428","0.0.636220"]},
            doodlePunks: { roleName: "DoodlePunks", token_id: ["0.0.645282"]},
            doodleShadyz: { roleName: "DoodleShadyz", token_id:["0.0.797653"]},
            raffleTickets: { roleName: "Raffle Participants", token_id: ["0.0.858134"]}
        },
        Dialoges: [
            'Please wait while we process your WalletID: ',
            {type: 'doodle', key: 'Doodles',content: 'Doodles: ', total: 0},
            {type: 'doodle', key: 'DoodlePunks',content: 'Doodle Punks: ', total: 0},
            {type: 'doodle', key: 'DoodleShadyz',content: 'Doodle Shadyz: ', total: 0},
            {type: 'doodle', key: 'LazyDoodles',content: 'Lazy Doodles: ', total: 0},
            {type: 'badge', key: 'fusions',content: 'Fusion', total: 0},
            {type: 'badge', key: 'silvers',content: 'Silver', total: 0},
            {type: 'badge', key: 'golds',content: 'Gold', total: 0},
            {type: 'badge', key: 'diamonds',content: 'Diamond', total: 0},
            {type: 'badge', key: 'eternals',content: 'Eternal', total: 0},
            {type: 'raffleTicket', key: 'RaffleTickets',content: 'Raffle Ticket: ', total: 0},
            {type: 'dialoge', key: 'TotalDoodle',content: 'Total Doodle', total: 0},
            {type: 'dialoge', key: 'TotalBadge',content: 'Total Badge', total: 0},
            {type: 'dialoge', key: 'Roles',content: 'Congratulations, You received role', total: 0},
        ]
    }
}