module.exports = {
    SERPENTS: {
        // NFT Checker
        OGSerpent: ["0.0.663700","0.0.605855"],
        ogViper: ["0.0.662854"],
        Serpent: ["0.0.996741"],
        CyberSerpent: ["0.0.794863"],
        UkraineSerpent: ["0.0.744276"],
        // Role Giver
        Roles: {
            // OG Serpent 1x or more. (0.0.663700 & 0.0.605855)
            ogSerpent: { roleName: "OG Serpent", role_id: "987223258388631622",
            nfts: [
            // 1X ANY OF THE TWO
            {condition: 1, token_id:"0.0.663700"}, {condition: 1, token_id:"0.0.605855"}
            ]},

            // OG VIPer Role 1x or more. (0.0.662854)
            ogVIPer: { roleName: "OG VIPer", role_id: "987223446108905512",
            nfts: [
            // 1X
            {condition: 1, token_id:"0.0.662854"},
            ]},

            // Serpent 1x or more. Gen 2 Serpents (0.0.996741)
            serpent: { roleName: "Serpent", role_id: "987224034745929728", 
            nfts: [
            // 1X
            {condition: 1, token_id: "0.0.996741"}
            ]},

            // Cyber Serpent Role 1x or more.  (0.0.794863)
            cyberSerpent: { roleName: "Cyber Serpent", role_id: "987223638702952458", 
            nfts: [
            // 1X
            {condition: 1, token_id: "0.0.794863"}
            ]},

            // Ukraine Serpent Role 1x or more. (0.0.744276)
            ukraineSerpent: { roleName: "Ukraine Serpent", role_id: "987223764620157009", 
            nfts: [
            // 1X
            {condition: 1, token_id: "0.0.744276"}
            ]},

            // Serpent Charmer Role *** Either Case 1 OR 2
            serpentCharmer: { roleName: "Serpent Charmer", role_id: "987223881813225502", 
            nfts: [
            // Case 1
            {condition: 10, token_id: "0.0.996741"}, // 10X Serpent
            // Case 2
            [{condition: 1, token_id: "0.0.662854"}, // 1X OG VIPer AND
             {condition: 5, token_id: "0.0.996741"}, // 5X Serpent OR
             [{condition: 1, token_id: ["0.0.794863","0.0.744276"]}] // 1X VIPer (1 peace from any token)
            ]]},

            //VIPer Role
            VIPer: { roleName: "VIPer", role_id: "987224034745929728",
            nfts: [
            // Case 1 1X ANY OF THE FIRST TWO                                                  
            {condition: 1, token_id: "0.0.794863"}, // CYBER Serpent
            {condition: 1, token_id: "0.0.744276"}, // Ukraine Serpent
            // Case 2 5X SERPENT
            {condition: 5, token_id: "0.0.996741"}
            ]}
        },
        // Looper in the process
        Dialoges: [
            {type: 'serpent', key: 'OGSerpent',content: 'OG Serpent: ', total: 0},
            {type: 'serpent', key: 'ogViper',content: 'OG Viper: ', total: 0},
            {type: 'serpent', key: 'Serpent',content: 'Serpent: ', total: 0},
            {type: 'serpent', key: 'CyberSerpent',content: 'Cyber Serpent: ', total: 0},
            {type: 'serpent', key: 'UkraineSerpent',content: 'Ukraine Serpent: ', total: 0},            
            {type: 'dialoge', key: 'TotalSerpent',content: 'Total Serpent', total: 0},
            {type: 'dialoge', key: 'serpentCharmer',content: 'Serpent Charmer', bool: false},
            {type: 'dialoge', key: 'VIPer',content: 'VIPer', bool: false},
            {type: 'dialoge', key: 'Roles',content: 'CongratulationSss, You received roleSss', total: 0},
        ],
        // Guild and Info
        channel: {
            announcement: "https://discord.com/channels/980041480636878848/980041480636878851",
            connect: "https://discord.com/channels/980041480636878848/980041529940926524"
        },
        memberCalled: "Serpents",
        projectKey: "serpentproject",
        guild_id: "980041480636878848"
    },
}