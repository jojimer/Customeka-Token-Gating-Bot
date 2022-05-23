module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {

        let action;
        let errorInteraction;
        const client = interaction.client;

        // SlashCommand Interaction
        if(interaction.isCommand()) {
            action = client.commands.get(interaction.commandName);
            errorInteraction = 'command';       
        }

        // Button Interaction
        if(interaction.isButton()) {
            const a = client.buttons.get('sendWalletId');
            action = (interaction.customId === 'submitWalletId') ? a.submit : a.cancel;
            errorInteraction = 'button';
        }

        if (!action) return;

        try {
            await action.execute(interaction);
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: `There was an error while executing this ${errorInteraction}!`, ephemeral: true });
        }
	},
};