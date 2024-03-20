// eslint-disable-next-line no-unused-vars
const { Collection, ChatInputCommandInteraction, AutocompleteInteraction, Events } = require('discord.js');
const Event = require('../../structures/Event');
const chalk = require('chalk');
const getTime = require('../../utils/misc/getTime');
const Cooldown = new Collection();

module.exports = class extends Event {

	constructor(...args) {
		super(
			...args,
			{
				name: "Slash Command",
				event: Events.InteractionCreate,
			}
		);
	}

	/**
     *
     * @param {ChatInputCommandInteraction|AutocompleteInteraction} interaction Interaction
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

		if (!interaction.isCommand() && !interaction.isAutocomplete()) return;

		if (interaction.isAutocomplete()) {
			const command = this.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			}
			catch (error) {
				console.error(error);
			}
		}

		if (!interaction.isCommand()) return;

		if (interaction.channel?.type === 'DM') return;

		const { member, guild, user, channel } = interaction;

		if (!channel || !member || !guild) return;

		await Promise.all([
			this.client.logger.log(
				chalk.red(`Command Processor ${interaction.id}`),
				chalk.white(`Received ${interaction.commandName} at: ${getTime(start)}`)
			),
			this.client.logger.log(
				chalk.red(`Command Processor ${interaction.id}`),
				chalk.white(`[${getTime(interaction.createdAt)}] ${interaction.commandName}, U${interaction.user.id}, G${interaction.guild.id}`)
			)
		]).catch(() => {
			// .
		});


		// if ((Date.now() - interaction.createdTimestamp) >= 5000) return;


		const command = this.client.commands.get(interaction.commandName);


		if (!command) return;

		const embed = this.client.embeds.generateEmbed()
			.setColor(this.client.colors.fail);

		const CommandCooldowns = Cooldown.get(command.name) || Cooldown.set(command.name, new Collection()).get(command.name);

		const oldTime = CommandCooldowns.get(`${guild.id}_${user.id}`) || CommandCooldowns.get(`${guild.id}`);

		if (oldTime && !this.client.utils.checkOwner(interaction.user.id)) {
			const now = Date.now();
			const timeLeft = (oldTime - now) / 1000;

			embed
				.setDescription(`${this.client.emotes.fail} Please wait **${timeLeft.toFixed(2)}** second(s) before using this command again.`);

			if (now < oldTime) {
				await interaction.reply({ embeds: [embed], fetchReply: true }).then(msg => {
					this.client.utils.deleteMessage(msg, 3000);
				}).catch(() => {
					// .
				});
				return;
			}
		}

		if (!this.client.utils.checkOwner(interaction.user.id)) {
			if (command.globalCD) CommandCooldowns.set(`${guild.id}_${user.id}`, Date.now() + (command.cooldown * 1000));
			else CommandCooldowns.set(`${guild.id}`, Date.now() + (command.cooldown * 1000));
		}


		/*
		this.client.logger.send({
			type: 'Command Used',
			name: command.name,
			channel: `${interaction.channel.name} (${interaction.channel.id})`,
			guild: `${interaction.guild.name} (${interaction.guild.id})`,
			author: `${interaction.user.tag} (${interaction.user.id})`,
			used: Date.now()
		});
*/


		// if ((Date.now() - interaction.createdTimestamp) >= 5000) return;

		if (command.dev && !this.client.utils.checkOwner(user.id)) {
			embed.setDescription(`You're missing developer permission to run this command.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (command.admin && !this.client.utils.checkAdmin(user.id) && !this.client.utils.checkOwner(user.id)) {
			embed.setDescription(`You're missing admin permission to run this command.`);
			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (command.disabled && !this.client.utils.checkOwner(user.id)) {
			embed.setDescription(`This command has been disabled by the developers.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (command.nsfw && !channel.nsfw) {
			embed.setDescription(`This channel must be a **NSFW** channel to run this command.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		if (command.useDB && Object.keys(this.client.database.models).length <= 0) {
			embed.setDescription(`This command need a configurated database service to run.`);

			await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
			});

			return;
		}

		const requiredRoles = command.roles.filter(id => member.roles.cache.has(id));

		const memberPermissions = channel.permissionsFor(member);

		const userPermCheck = command.userPermissions;


		if (command.flag === 'ROLE') {
			if (command.roles.length && !requiredRoles.length) {
				embed.setDescription(`${this.client.emotes.fail} You're missing permissions required to use this command.`);

				await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
				// .
				});

				return;
			}
		} else if (userPermCheck) {
			const missing = [];
			for (const perm of userPermCheck) {
				if (!memberPermissions.has(perm)) {
					missing.push(perm);
				}
			}
			// `Missing permission(s)`, missing.map(this.client.utils.formatPerms).join('\n')
			if (missing.length) {
				embed.setDescription(`${this.client.emotes.fail} You're missing permissions required to use this command.`)
					.addField(`Missing permission(s)`, missing.map(this.client.utils.formatPerms).join('\n'));

				await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
					// .
				});

				return;
			}
		}

		const botPermCheck = command.botPermissions;

		if (botPermCheck) {
			const missing = [];
			const permissions = channel.permissionsFor(guild.me);
			for (const perm of botPermCheck) {
				// eslint-disable-next-line max-depth
				if (!permissions.has(perm)) {
					missing.push(perm);
				}
			}
			// const missing = message.channel.permissionsFor(this.client.user).missing(botPermCheck);
			if (missing.length) {
				embed.setDescription(`${this.client.emotes.cross} Bot is missing permissions required to run this command.`)
					.addField(`Missing permission(s)`, missing.map(this.client.utils.formatPerms).join('\n'));

				await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {
					// .
				});

				return;
			}
		}

		// if ((Date.now() - interaction.createdTimestamp) >= 5000) return;

		try {
			await command.run(interaction);
		} catch (err) {
			this.client.logger.error(`An unexpected occured in command: ${command.name}`);

			console.error(err);

			let type = 'reply';
			if (interaction.deferred || interaction.replied) {
				type = 'editReply';
			}
			await interaction[type]({ content: 'There was an error while executing this command!', ephemeral: true }).catch(() => {
				// .
			});
		}
	}

};
