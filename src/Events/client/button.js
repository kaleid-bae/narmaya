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
				name: "Button Event Listener",
				event: Events.InteractionCreate,
			}
		);
	}

	/**
     *
     * @param {ButtonInteraction} interaction Interaction
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

        if (!interaction.isButton()) return;

		const { member, guild, user, channel, customId } = interaction;

		if (!customId) return;

		await Promise.all([
			this.client.logger.log(
				chalk.red(`Button Processor ${interaction.id}`),
				chalk.white(`Received ${interaction.customId} at: ${getTime(start)}`)
			),
			this.client.logger.log(
				chalk.red(`Button Processor ${interaction.id}`),
				chalk.white(`[${getTime(interaction.createdAt)}] ${interaction.customId}, U${interaction.user.id}, G${interaction.guild.id}`)
			)
		]).catch(() => {
			// .
		});


		const button = this.client.handler.buttons.find(btn => btn.id.startsWith(customId));

		if (!button) return;

		const embed = this.client.embeds.generateEmbed()
			.setColor(this.client.colors.fail);

		if (button.dev && !this.client.utils.checkOwner(user.id)) {
			embed.setDescription(`You're missing developer permission to run this button.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (button.admin && !this.client.utils.checkAdmin(user.id) && !this.client.utils.checkOwner(user.id)) {
			embed.setDescription(`You're missing admin permission to run this button.`);
			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (button.disabled && !this.client.utils.checkOwner(user.id)) {
			embed.setDescription(`This button has been disabled by the developers.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (button.useDB && Object.keys(this.client.database.models).length <= 0) {
			embed.setDescription(`This button need a configurated database service to run.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (button.isDM) {
			
			// Check if interaction is outside of DM
			if (channel?.type != ChannelType.DM) {
				embed.setDescription(`${this.client.emotes.fail} This button can only be used within DM channel.`);
	
				await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
				});
	
				return;
			}
		}
		else {
			const requiredRoles = button.roles.filter(id => member.roles.cache.has(id));
			if (button.roles.length && !requiredRoles.length) {
				embed.setDescription(`${this.client.emotes.fail} You're missing permissions required to use this buttons.`);
	
				await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
				});
	
				return;
			}
		}

		try {
			await button.run(interaction);
		} catch (err) {
			this.client.logger.error(`An unexpected occured in button: ${button.name}`);

			console.error(err);

			let type = 'reply';
			if (interaction.deferred || interaction.replied) {
				type = 'editReply';
			}
			await interaction[type]({ content: 'There was an error while executing this button!', ephemeral: true }).catch(() => {
				// .
			});
		}
	}

};
