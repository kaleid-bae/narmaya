// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Command = require('../../structures/Command');
module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'restart',
				category: 'Owner',
				description: 'This command allows you to restart the bot.',
				globalCD: true,
				cooldown: 10,
				usage: ['[refresh-command]'],
				dev: true
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('restart')
			.setDescription(`This command allows you to restart the bot.`)
			.addBooleanOption(option => 
				option.setName("refresh-command")
				.setDescription("Refresh registered discord commands.")
				)
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		);
	}
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction Interaction
	 */
	async run(interaction) {
		let err = null;
		const refresh = interaction.options.getBoolean("refresh-command") || false;

		if (refresh) {
			await interaction.reply({ ephemeral: true, content: 'Updating slash commands to discord...' }).catch((err2) => {
				err = err2;
			});

			const success = await this.client.utils.uploadCommands();

			if (success) {
				await interaction.editReply({ content: 'Success! Restarting Bot.' }).catch((err2) => {
					err = err2;
				});
			}

			else {
				await interaction.editReply({ content: 'Failed to update slash command... Please check the console later. Restarting Bot.' }).catch((err2) => {
					err = err2;
				});
			}


			if (err) {
				console.error(err);
				return;
			};
		}

		else {
			await interaction.reply({ ephemeral: true, content: 'Restarting bot.' }).catch((err2) => {
				err = err2;
			});
	
			if (err) return;
		}

		await this.client.destroy();

		process.exit(1);
	}

};
