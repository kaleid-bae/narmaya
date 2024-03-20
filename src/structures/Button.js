// eslint-disable-next-line no-unused-vars
const { ButtonInteraction } = require('discord.js');
const Bot = require('./Bot');

/**
 * @typedef {Object} Options
 * @property {string} id
 * @property {?boolean} dev
 * @property {?boolean} admin
 * @property {?boolean} useDB
 * @property {?string[]} roles
 * @property {?boolean} isDM
 * @property {?boolean} disabled
 */

module.exports = class Button {

	/**
	 *
	 * @param {Bot} client
	 * @param {Options} options
	 */

	constructor(client, options) {
		this.client = client;
		this.id = options.id;
		this.dev = options.dev || false;
		this.admin = options.admin || false;
		this.roles = options.roles || [];
		this.useDB = options.useDB || false;
		this.isDM = options.isDM || false;
		this.disabled = options.disabled || false;
	}

	// eslint-disable-next-line no-unused-vars
	/**
     *
     * @param {ButtonInteraction} interaction Interaction
     */
	// eslint-disable-next-line no-unused-vars
	async run(interaction) {
		throw new Error(`The run method has not been implemented in button ${this.id}`);
	}

};
