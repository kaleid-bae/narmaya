// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, AutocompleteInteraction } = require('discord.js');
const Command = require('../../structures/Command');


module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'faq',
				category: 'Resource',
				description: 'This command will provide some of the FAQ you might want to know.',
				globalCD: true,
				cooldown: 10,
				usage: ["[topic]"]
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('faq')
			.setDescription('This command will provide some of the FAQ you might want to know.')
			.addStringOption(option => 
				option.setName('topic')
				.setDescription('The topic of your choice')
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
		const listTopic = Object.entries(this.client.resource.faqdata).map(([key, value]) => ({name: value.title, value: key}));

		let choices = [];
        
		if (focusedOption.name == "topic") {
			choices = listTopic.filter(data => data.name.toLowerCase().includes(focusedOption.value.toLowerCase()))
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
		const topic = interaction.options.getString("topic");
		const faq_data = this.client.resource.faqdata[topic];

		if (!faq_data) {
			embed.setColor("Red")
			.setDescription(`The FAQ topic for ${this.client.utils.capitalise(topic)} is not available. Please try another option.`);

			return interaction.reply({embeds: [embed]});
		}

        const description = faq_data?.link ? `### [${faq_data.title}](${faq_data?.link})` : `### ${faq_data.title}`

		embed.setDescription(`${description}\n${faq_data?.data || faq_data?.help}`)
        .setThumbnail(faq_data?.image)
        .setColor("Random");

        return interaction.reply({embeds: [embed]});
	}

};
