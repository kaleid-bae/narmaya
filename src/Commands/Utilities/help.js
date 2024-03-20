// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const Command = require('../../structures/Command');


module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'help',
				category: 'Utilities',
				description: 'Show commands list or specific command help.',
				cooldown: 10,
				usage: ['[command]']
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('help')
			.setDescription(`Show commands list or specific command help.`)
			.addStringOption(option => option.setName('command')
				.setDescription(`Shows details about how to use a command.`)
				.setAutocomplete(true)
				.setRequired(false)));
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
		const { user } = interaction;
		const command = interaction.options.getString('command');

		let { commands } = this.client;

		if (!this.client.utils.checkOwner(user.id)) commands = commands.filter(cmd => cmd.category !== 'Owner' && !cmd.dev);

		if (!this.client.utils.checkAdmin(user.id)) commands = commands.filter(cmd => cmd.category !== 'admin' && !cmd.admin);

		if (command) {
			const cmd = commands.get(command.toLowerCase());

			if (!cmd) {
				// eslint-disable-next-line id-length
				const similar = commands.filter(c => c.name.toLowerCase().startsWith(command.toLowerCase()));

				await interaction.reply({ embeds: [
					this.helpCommandInvalid(command, similar.map(c2 => `\`${c2.name}\``).join(', '))
				] }).catch(() => {
					// .
				});

				return;
			}

			const embed = this.helpCommandFound(cmd);

			await interaction.reply({
				embeds: [embed]
			}).catch(() => {
				// .
			});
		} else {
			const embed = this.helpEmbedList(commands);

			await interaction.reply({
				embeds: [embed]
			}).catch(() => {
				// .
			});
		}
	}

	helpEmbedList(commands) {
		const embed = this.client.embeds.generateEmbed()
			.setDescription(`Command Parameters: \`<>\` is strict & \`[]\` is optional`);

		const categories = this.client.utils.removeDuplicates(commands.map(cmd => cmd.category));

		for (const category of categories) {
			// eslint-disable-next-line id-length
			const categoryCommands = commands.filter(c => c.category === category);

			embed.addField({ name: `**• ${this.client.utils.capitalise(category)} (${categoryCommands.size})**`, value: `${categoryCommands.map(cmd => `\`${cmd.name}\``).join(', ')}` });
		}

		return embed;
	}

	helpCommandInvalid(command, similar) {
		const embed = this.client.embeds.generateEmbed()
			.setColor(this.client.colors.fail)
			.setDescription(`${this.client.emotes.fail} No command found for \`${command}\`.${similar ? `\n\n__**Did you mean?:**__\n${similar}` : ''}`);

		return embed;
	}

	helpCommandFound(cmd) {
		const embed = this.client.embeds.generateEmbed();

		embed
			.setTitle(`Command: ${cmd.name}`)
			.setDescription(`> ${cmd.description}`);

		const userPerms = cmd.userPermissions.map(this.client.utils.formatPerms);
		const botPerms = cmd.botPermissions.map(this.client.utils.formatPerms);

		if (cmd.category) embed.addField({ name: `**❯ Category:**`, value: `**${cmd.category}**` });
		if (cmd.usage.length) embed.addField({ name: `**❯ Usage(s):**`, value: cmd.usage.map(str => `\`${cmd.name} ${str}\``).join('\n') });
		if (cmd.example.length) embed.addField({ name: `**❯ Example(s):**`, value: cmd.example.map(str => `\`${cmd.name} ${str}\``).join('\n') || 'No example provided' });
		if (userPerms.length) embed.addField({ name: `**❯ User Permission(s):**`, value: userPerms.map(str => `\`${str}\``).join('\n') });
		if (botPerms.length) embed.addField({ name: `**❯ Bot Permission(s):**`, value: botPerms.map(str => `\`${str}\``).join('\n') });

		if (cmd.cooldown) embed.addField({ name: `**❯ Cooldown:**`, value: `**${cmd.cooldown}**` });

		return embed;
	}

};
