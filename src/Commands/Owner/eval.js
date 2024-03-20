// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Command = require('../../structures/Command');
const Sourcebin = require('sourcebin');
const { Type } = require('@anishshobith/deeptype');
const { inspect } = require('util');
const Discord = require('discord.js');


module.exports = class extends Command {

	constructor(...args) {
		super(
			...args,
			{
				name: 'eval',
				category: 'Owner',
				description: 'This command allows you to evaluate code.',
				globalCD: true,
				cooldown: 10,
				dev: true
			}
		);

		this.createSlash(new SlashCommandBuilder()
			.setName('eval')
			.setDescription('This command allows you to evaluate code.')
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		);
	}
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction Interaction
	 */
	async run(interaction) {
		// eslint-disable-next-line no-unused-vars
		const { client } = this;
		// eslint-disable-next-line no-unused-vars
		const { guild, channel, user, member } = interaction;

		const row = this.client.utils.cancelButton();

		let err = null;

		const msg = await interaction.reply({ content: 'Please respond with the code to run.', components: [row], fetchReply: true }).catch((err2) => {
			err = err2;
		});

		if (err) return;

		let response = await this.client.utils.awaitResponse(msg, user, row, 60 * 1000).catch(() => {
			// .
		});

		if (!msg || !response) {
			return;
		}

		response = response.content;

		// await interaction.deferReply({ ephemeral: true });

		const code = response.replace(/[""]/g, '"').replace(/['']/g, "'");

		let evaled;
		const start = process.hrtime();
		const startMS = Date.now();
		try {
			evaled = await eval(code);
		} catch (err2) {
			evaled = err2;
		}

		const timeMS = Math.round(Date.now() - startMS);

		const end = process.hrtime(start);

		let big = false;
		let link = null;

		if (inspect(evaled, { depth: 0 }).length > 999) {
			let output = await Sourcebin.create([{
				name: 'output',
				content: this.clean(inspect(evaled, { depth: 0 })),
				languageId: 'js'
			}], {
				title: 'Evaluation Output',
				description: 'Outcome of eval command.'
			});
			output = output.short;

			link = `[Click here to view result](${output})`;
			big = true;
		}

		const text = big ? link : `\`\`\`js\n${this.clean(inspect(evaled, { depth: 0 }))}\n\`\`\``;

		const embed = this.client.embeds.generateEmbed(interaction.user)
			.addField({ name: ':inbox_tray: **INPUT**', value: `\`\`\`js\n${response}\n\`\`\`` })
			.addField({ name: ':outbox_tray: **OUTPUT**', value: text })
			.addField({ name: `:mailbox_with_mail:  **TYPE**`, value: `\`\`\`ts\n${new Type(evaled).is}\n\`\`\`` })
			.addField({ name: `:alarm_clock: **Execution Time:**`, value: `**\`\`\`\nPING: ${timeMS}ms\nTIME TAKEN: ${end[0]}s ${end[1] / 1000000}ms\n\`\`\`**` });

		const row2 = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
					.setLabel('Delete this message')
					.setStyle(Discord.ButtonStyle.Danger)
					.setCustomId('delete')
			);

		await msg.edit({ content: null, embeds: [embed], components: [row2] }).catch(err2 => {
			err = err2;
		});

		if (err) return;

		row2.components = row2.components.map(button => button.setDisabled(true));

		const interaction2 = await msg.awaitMessageComponent({
			max: 1,
			time: 10 * 60000,
			filter: (i2) => i2.user.id === user.id && i2.customId === 'delete'
		}).catch(() => {
			// .
		});

		if (!interaction2 || interaction2.customId !== 'delete') {
			await msg.edit({
				components: [row2]
			});
			return;
		}

		await interaction2.deferUpdate().catch(() => {
			// .
		});

		await this.client.utils.deleteMessage(msg);
	}

	clean(text) {
		if (typeof text === 'string') {
			text = text
				.replace(/`/g, `\`${String.fromCharCode(8203)}`)
				.replace(/@/g, `@${String.fromCharCode(8203)}`)
				.replace(new RegExp(this.client.token, 'gi'), 'TOK3N');
		}
		return text;
	}

};
