// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, AutocompleteInteraction } = require('discord.js');
const Command = require('../../structures/Command');


module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'guide',
				category: 'Resource',
				description: 'This command will provide some of the community guide for specified character.',
				globalCD: true,
				cooldown: 10,
				usage: ["[character]"]
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('guide')
			.setDescription('This command will provide some of the community guide for specified character.')
			.addStringOption(option => 
				option.setName('character')
				.setDescription('The character of your choice')
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
		const listCharacter = Object.keys(this.client.resource.characters);

		let choices = [];
        
		if (focusedOption.name == "character") {
			choices = listCharacter.filter(data => data.toLowerCase().includes(focusedOption.value.toLowerCase()))
            .slice(0, 24)
			.map(data => ({name: this.client.utils.capitalise(data), value: data}));
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
		const character = interaction.options.getString("character");
		const char_data = this.client.resource.characters[character];

		if (!char_data) {
			embed.setColor("Red")
			.setDescription(`The character guide for ${this.client.utils.capitalise(character)} is not available. Please try another option.`);

			return interaction.reply({embeds: [embed]});
		}

        const description = [
            `### ${this.client.emotes.star} ${char_data?.guide ? `[Guide Link](${char_data?.guide})` : '-'}`,
            `### ${this.client.emotes.thread} ${char_data?.thread ? `[Forum Link](${char_data?.thread})` : '-'}`,
        ];

		embed.setAuthor({name: `${this.client.utils.capitalise(character)}'s Guide`})
        .setThumbnail(char_data?.image)
        .setDescription(`Here's the guide resource for ${this.client.utils.capitalise(character)} that you can use!\n\n${description.join("\n")}`)
        .setColor("Random");

        return interaction.reply({embeds: [embed]});
	}

};
