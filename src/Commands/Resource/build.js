// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, AutocompleteInteraction } = require('discord.js');
const Command = require('../../structures/Command');


module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'build',
				category: 'Resource',
				description: 'This command will provide some of the sample build for specified character.',
				globalCD: true,
				cooldown: 10,
				usage: ["[character]"]
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('build')
			.setDescription('This command will provide some of the sample build for specified character.')
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
		const listCharacter = Object.keys(this.client.resource.charbuild);

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
		const check_build = this.client.resource.charbuild[character];

		if (!check_build) {
			embed.setColor("Red")
			.setDescription(`The character build for ${this.client.utils.capitalise(character)} is not available. Please try another option.`);

			return interaction.reply({embeds: [embed]});
		}

		const build_menu = this.client.utils.getCharacterBuildSelection(character, 1);
		const build_embed = this.client.utils.getCharacterBuildEmbed(character, 1);

        return interaction.reply({embeds: [build_embed], components: [build_menu]});
	}

};
