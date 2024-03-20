// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, ButtonInteraction } = require('discord.js');
const Button = require('../../structures/Button');


module.exports = class extends Button {

	constructor(...args) {
		super(
			...args,
			{
				id: 'button_test',
                isDM: false
			}
		);
	}
	/**
	 *
	 * @param {ButtonInteraction} interaction Interaction
	 */
	async run(interaction) {
		const { channel, user } = interaction;
        return interaction.reply({content: `How cool! ${user} has pressed the test button!`});
	}

};
