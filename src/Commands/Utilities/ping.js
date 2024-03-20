// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder } = require('discord.js');
const Command = require('../../structures/Command');


module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'ping',
				category: 'Utilities',
				description: 'This provides the ping of the bot.',
				globalCD: true,
				cooldown: 10
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('ping')
			.setDescription('This provides the ping of the bot.'));
	}
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction Interaction
	 */
	async run(interaction) {
		const start = Date.now();
		let err = null;
		await interaction.reply(`Pinging...`).catch((err2) => {
			err = err2;
		});

		if (err) return;

		const now = Date.now();

		const responseTime = now - start;

		const apiTime = this.client.ws.ping.toFixed(0);

		const embed = this.client.embeds.generateEmbed()
			.setDescription(`Bot ping: **${responseTime}**ms\nAPI ping: **${apiTime}**ms`);

		await interaction.editReply({
			content: null,
			embeds: [embed]
		}).catch(() => {
			// .
		});
	}

};
