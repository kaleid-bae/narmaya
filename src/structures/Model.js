// eslint-disable-next-line no-unused-vars
const Bot = require('./Bot');
// eslint-disable-next-line no-unused-vars
const DatabaseManager = require('./DatabaseManager');

class Model {

	// eslint-disable-next-line valid-jsdoc
	/**
	 *
	 * @param {string} name Name
	 * @param {import('sequelize').ModelAttributes} attributes Attributes
	 * @param {Bot} client Client
	 * @param {DatabaseManager} manager Manager
	 */
	constructor(name, attributes, client, manager) {
		/**
         * @type {Bot}
         */
		this.client = client;
		/**
         * @type {DatabaseManager}
         */
		this.manager = manager;

		this.model = this.manager.sequelize.define(`${this.manager.dbName}_${name}`, attributes);
	}

	async sync() {
		await this.model.sync();
	}

}

module.exports = Model;
