// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, ButtonInteraction, StringSelectMenuInteraction } = require('discord.js');
const SelectMenu = require('../../structures/SelectMenu');


module.exports = class extends SelectMenu {

	constructor(...args) {
		super(
			...args,
			{
				id: 'select_test',
                isDM: false
			}
		);
	}
	/**
	 *
	 * @param {StringSelectMenuInteraction} interaction Interaction
	 */
	async run(interaction) {
		const { channel, user, values } = interaction;
		const selected_value = values[0];

		return interaction.reply({content: `What does it say?\n> "${selected_value}"`});
	}

};
