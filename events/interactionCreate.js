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
            action = client.buttons.get(interaction.customId);
            errorInteraction = 'button';
        }

        // Modal Submit Interaction
        if(interaction.isModalSubmit()) {
            action = client.modals.get(interaction.customId);
            errorInteraction = 'Modal Submit';
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