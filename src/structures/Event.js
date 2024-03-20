// eslint-disable-next-line no-unused-vars
const { Events } = require('discord.js');
const Bot = require('./Bot');

/**
 * @typedef {Object} Options
 * @property {string} name
 * @property {Events} event
 * @property {?boolean} once
 * @property {?boolean} disabled
 */

module.exports = class Event {

	/**
	 *
	 * @param {Bot} client
	 * @param {Options} options
	 */

	constructor(client, options) {
		this.client = client;
		this.name = options.name;
		this.event = options.event;
		this.type = options.once ? 'once' : 'on';
		this.emitter = (typeof options.emitter === 'string' ? this.client[options.emitter] : options.emitter) || this.client;
		this.disabled = options.disabled || false;
	}

	// eslint-disable-next-line no-unused-vars
	async run(...args) {
		throw new Error(`The run method has not been implemented in ${this.name}`);
	}

};
