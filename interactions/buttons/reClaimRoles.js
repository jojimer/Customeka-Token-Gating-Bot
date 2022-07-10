const { MessageActionRow, MessageButton } = require('discord.js');
const { updateUserAccount } = require(appRoot+'/db_management/control');

module.exports = {
    name: 'reClaimRoles',
    data: {
        reclaimRole: new MessageActionRow().addComponents(
                new MessageButton()
                .setCustomId('reClaimRoles')
                .setLabel('Reclaim Roles!')
                .setStyle('DANGER')
                ),
    },
    async execute(interaction) {
        
        const nftData =  interaction.client.nft.get('data');
        const user_id = interaction.user.id;        
		const projectDirectory = 'NFT_PROJECTS/'+nftData.directory+'/';
        updateUserAccount(user_id,{verified:"claiming"},projectDirectory+'members');
        //interaction.reply({content: "Success",ephemeral: true});
    }
}