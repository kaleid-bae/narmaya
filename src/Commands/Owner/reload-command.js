// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, AutocompleteInteraction, PermissionFlagsBits } = require('discord.js');
const Command = require('../../structures/Command');


module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'reload-command',
				category: 'Owner',
				description: 'This command allows you to reload a command.',
				globalCD: true,
				cooldown: 10,
				usage: ['<input>'],
				dev: true
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('reload-command')
			.setDescription(`This command allows you to reload a command.`)
			.addStringOption(option => option
				.setName('input')
				.setDescription(`The command name to reload.`)
				.setAutocomplete(true)
				.setRequired(true))
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		);
	}

	/**
	 *
	 * @param {AutocompleteInteraction} interaction Interaction
	 */
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused() || '';

		const commands = this.client.commands.filter(cmd => cmd.name.includes(focusedValue));
        const choices = commands.map(data => ({name: data.name, value: data.name }))

        await interaction.respond(choices);
    }


	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction Interaction
	 */
	async run(interaction) {
		let err = null;
		await interaction.deferReply({ ephemeral: true }).catch(err2 => {
			err = err2;
		});
		if (err) return;
		const commandName = interaction.options.getString('input').toLowerCase();

		const command = this.client.commands.get(commandName);

		const embed = this.client.embeds.generateEmbed();

		if (!command) {
			embed.setColor(this.client.colors.fail)
				.setDescription(`${this.client.emotes.fail} Command \`${commandName}\` has not been found.`);

			await interaction.editReply({ embeds: [embed] }).catch(() => {
				// .
			});

			return;
		}

		const dir = `..${command.category !== 'Miscellaneous' ? `/${command.category}` : ''}/${command.name}.js`;

		try {
			delete require.cache[require.resolve(dir)];
			const NewCommand = require(dir);
			const cmd = new NewCommand(this.client);
			// eslint-disable-next-line new-cap
			this.client.commands.set(command.name.toLowerCase(), cmd);
		} catch (error) {
			this.client.logger.error(error);

			embed.setColor(this.client.colors.fail)
				.setDescription(`${this.client.emotes.fail} Unable to reload command.\nError: ${error.message}`);

			await interaction.editReply({ embeds: [embed] }).catch(() => {
				// .
			});

			return;
		}

		embed.setDescription(`${this.client.emotes.tick} Successfully reloaded \`${command.name}\`.`);

		await interaction.editReply({ embeds: [embed] }).catch(() => {
			// .
		});

		return;
	}

};
