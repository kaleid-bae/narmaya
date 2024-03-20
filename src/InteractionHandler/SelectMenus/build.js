// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, ButtonInteraction, StringSelectMenuInteraction } = require('discord.js');
const SelectMenu = require('../../structures/SelectMenu');


module.exports = class extends SelectMenu {

	constructor(...args) {
		super(
			...args,
			{
				id: 'build',
                isDM: false
			}
		);
	}
	/**
	 *
	 * @param {StringSelectMenuInteraction} interaction Interaction
	 */
	async run(interaction) {
		const { channel, user, values, customId } = interaction;
		const character = customId.split("_")[1];
		const selected_value = values[0];

		const build_menu = this.client.utils.getCharacterBuildSelection(character, selected_value);
		const build_embed = this.client.utils.getCharacterBuildEmbed(character, selected_value);

		await interaction.message.edit({embeds: [build_embed], components: [build_menu]});
		return interaction.deferUpdate();
	}

};
