// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, ApplicationCommand, SlashCommandBuilder } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Bot = require('./Bot');

/**
 * @typedef {Object} Options
 * @property {?string} category
 * @property {string} name
 * @property {?number} cooldown
 * @property {?import('discord.js').PermissionResolvable[]} userPermissions
 * @property {?import('discord.js').PermissionResolvable[]} botPermissions
 * @property {?string[]} roles
 * @property {?string} description
 * @property {?boolean} dev
 * @property {?boolean} admin
 * @property {?boolean} useDB
 * @property {?boolean} disabled
 * @property {?string[]} usage
 * @property {?string[]} example
 * @property {?boolean} globalCD
 * @property {'PERMISSION'|'ROLE'} flag
 */

class Command {

	/**
     *
     * @param {Bot} client Client
     * @param {Options} options Options
     */
	constructor(client, options) {
		this.client = client;

		this.builder = null;

		this.name = options.name;

		this.category = options.category;

		this.cooldown = options.cooldown || 7;

		this.userPermissions = options.userPermissions || [];

		this.botPermissions = options.botPermissions || [];

		this.description = options.description;

		this.dev = options.dev || false;
		this.admin = options.admin || false;

		this.useDB = options.useDB || false;

		this.disabled = options.disabled || false;

		this.usage = options.usage || [];

		this.example = options.example || [];

		this.globalCD = options.globalCD || false;

		this.roles = options.roles || [];

		this.flag = options.flag || 'PERMISSION';
	}

	/**
     *
     * @param {ChatInputCommandInteraction} interaction Interaction
     */
	async how(interaction) {
		const embed = this.client.embeds.generateEmbed()
			.setThumbnail(interaction.user.avatarURL({ format: 'png', dynamic: true }))
			.setTitle(`Command: ${this.name}`)
			.setDescription(`> ${this.description.replace(/\\n/g, '> ')}`);

		return interaction.reply({ embeds: [embed] }).catch(() => {
			// .
		});
	}
	/**
     *
     * @param {ChatInputCommandInteraction} interaction Interaction
     */
	// eslint-disable-next-line no-unused-vars
	async run(interaction) {
		throw new Error(`[Command ${this.name}] The run method has not been configured.`);
	}
	/**
     *
     * @param {AutocompleteInteraction} interaction Interaction
     */
	// eslint-disable-next-line no-unused-vars
	async autocomplete(interaction) {
		throw new Error(`[Command ${this.name}] The autocomplete method has not been configured.`);
	}
	/**
	 *
	 * @param {SlashCommandBuilder} builder Builder
	 */
	createSlash(builder) {
		this.builder = builder;
	}
	/**
	 *
	 * @param {ApplicationCommand} cached API cached value
	 * @returns {boolean}
	 */
	isChanged(cached) {
		if (!cached) return false;

		const value = cached.equals(this.builder.toJSON(), true);

		return !value;
	}

}


module.exports = Command;
