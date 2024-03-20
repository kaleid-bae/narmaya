// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, AutocompleteInteraction } = require('discord.js');
const Command = require('../../structures/Command');


module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'farm',
				category: 'Resource',
				description: 'This command will provide some of the best farm place for items.',
				globalCD: true,
				cooldown: 10,
				usage: ["[item]"]
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('farm')
			.setDescription('This command will provide some of the best farm place for items.')
			.addStringOption(option => 
				option.setName('item')
				.setDescription('The item of your choice')
				.setAutocomplete(true)
				.setRequired(true)
				)
			);
	}

	/**
	 *
	 * @param {AutocompleteInteraction} interaction Interaction
	 */
    async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		const listItem = Object.entries(this.client.resource.farmdata).map(([key, value]) => ({name: value.title, value: key}));

		let choices = [];
        
		if (focusedOption.name == "item") {
			choices = listItem.filter(data => data.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
            .slice(0, 24);
		}

        await interaction.respond(choices);
    }

	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction Interaction
	 */
	async run(interaction) {
		const { channel, user } = interaction;
        const embed = this.client.embeds.generateEmbed();
		const item = interaction.options.getString("item");
		const faq_data = this.client.resource.faqdata[item];

		if (!faq_data) {
			embed.setColor("Red")
			.setDescription(`The Farm data for ${this.client.utils.capitalise(item)} is not available. Please try another option.`);

			return interaction.reply({embeds: [embed]});
		}

        const description = faq_data?.link ? `### [${faq_data.title}](${faq_data?.link})` : `### ${faq_data.title}`

		embed.setDescription(`${description}\n${faq_data?.data || faq_data?.help}`)
        .setThumbnail(faq_data?.image)
        .setColor("Random");

        return interaction.reply({embeds: [embed]});
	}

};
