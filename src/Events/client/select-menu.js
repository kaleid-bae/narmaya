// eslint-disable-next-line no-unused-vars
const { Collection, Events, ButtonInteraction, ChannelType } = require('discord.js');
const Event = require('../../structures/Event');
const chalk = require('chalk');
const getTime = require('../../utils/misc/getTime');
const Cooldown = new Collection();

module.exports = class extends Event {

	constructor(...args) {
		super(
			...args,
			{
				name: "Select Menu Event Listener",
				event: Events.InteractionCreate,
			}
		);
	}

	/**
     *
     * @param {import('discord.js').AnySelectMenuInteraction} interaction Interaction
     */
	// eslint-disable-next-line complexity
	async run(interaction) {
		const start = new Date();

        if (this.client.maintenance && !this.client.utils.checkOwner(interaction.user.id)) {
			try {
				return interaction.reply({content: "The bot is undergoing maintenance. Please wait until further updates.", ephemeral: true});
			}
			catch (error) {
				console.error(error);
			}
		}

        if (!interaction.isAnySelectMenu()) return;

		if (interaction.channel.type === 'DM') return;

		const { member, guild, user, channel, customId } = interaction;

		if (!customId) return;

		await Promise.all([
			this.client.logger.log(
				chalk.red(`Select Menu Processor ${interaction.id}`),
				chalk.white(`Received ${interaction.customId} at: ${getTime(start)}`)
			),
			this.client.logger.log(
				chalk.red(`Select Menu Processor ${interaction.id}`),
				chalk.white(`[${getTime(interaction.createdAt)}] ${interaction.customId}, U${interaction.user.id}, G${interaction.guild.id}`)
			)
		]).catch(() => {
			// .
		});


		const select_menu = this.client.handler.selectMenus.find(menu => menu.id.startsWith(customId));

		if (!select_menu) return;

		const embed = this.client.embeds.generateEmbed()
			.setColor(this.client.colors.fail);

		if (select_menu.dev && !this.client.utils.checkOwner(user.id)) {
			embed.setDescription(`You're missing developer permission to run this select_menu.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (select_menu.admin && !this.client.utils.checkAdmin(user.id) && !this.client.utils.checkOwner(user.id)) {
			embed.setDescription(`You're missing admin permission to run this select_menu.`);
			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (select_menu.disabled && !this.client.utils.checkOwner(user.id)) {
			embed.setDescription(`This select_menu has been disabled by the developers.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (select_menu.useDB && Object.keys(this.client.database.models).length <= 0) {
			embed.setDescription(`This select_menu need a configurated database service to run.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (select_menu.isDM) {
			
			// Check if interaction is outside of DM
			if (channel?.type != ChannelType.DM) {
				embed.setDescription(`${this.client.emotes.fail} This select_menu can only be used within DM channel.`);
	
				await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
				});
	
				return;
			}
		}
		else {
			const requiredRoles = select_menu.roles.filter(id => member.roles.cache.has(id));
			if (select_menu.roles.length && !requiredRoles.length) {
				embed.setDescription(`${this.client.emotes.fail} You're missing permissions required to use this select_menus.`);
	
				await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
				});
	
				return;
			}
		}

		try {
			await select_menu.run(interaction);
		} catch (err) {
			this.client.logger.error(`An unexpected occured in select_menu: ${select_menu.name}`);

			console.error(err);

			let type = 'reply';
			if (interaction.deferred || interaction.replied) {
				type = 'editReply';
			}
			await interaction[type]({ content: 'There was an error while executing this select_menu!', ephemeral: true }).catch(() => {
				// .
			});
		}
	}

};
