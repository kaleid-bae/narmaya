// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const Command = require('../../structures/Command');


module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'test',
				category: 'Other',
				description: 'This is a test command to check out non slash event handler.',
				globalCD: true,
				cooldown: 10
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('test')
			.setDescription('This is a test command to check out non slash event handler.'));
	}
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction Interaction
	 */
	async run(interaction) {
		const { channel, user } = interaction;
        const embed = this.client.embeds.generateEmbed();
        const buttons = this.client.utils.testButton();
        const selectMenus = this.client.utils.testSelectMenu();

        embed.setAuthor({name: user.displayName, iconURL: user.displayAvatarURL({dynamic: true})})
            .setColor("Greyple")
            .setDescription("Feel free to tap on the components below")
            .setTimestamp();

        return interaction.reply({embeds: [embed], components: [selectMenus, buttons]});
	}

};
