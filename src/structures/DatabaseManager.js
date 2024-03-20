const NodeCache = require('node-cache');
// eslint-disable-next-line no-unused-vars
const { Sequelize, DataTypes } = require('sequelize');
// eslint-disable-next-line no-unused-vars
const Bot = require('./Bot');
const Model = require('./Model');
const chalk = require('chalk');

class DatabaseManager {

	constructor(client) {
		/**
         * @type {Bot}
         */
		this.client = client;

		this.cache = new NodeCache();

		/**
		 * @type {Sequelize}
		 */
		this.sequelize
		
		/**
		 * @type {Object.<string, Model>}
		 */
		this.models = {};
	}

	get config() {
		return this.client.config;
	}
	get dbName() {
		return this.config.postgres.name;
	}

	async connectDatabase() {
		if (!this.config.postgres.active) {
			return this.client.logger.log(chalk.magenta('Database Manager'), chalk.redBright('Postgres config is not active! Database connection will not be established.'));
		}

		this.sequelize = new Sequelize(this.config.postgres.database, this.config.postgres.username, this.config.postgres.password, {
			dialect: this.config.postgres.dialect,
			logging: this.config.postgres.logging
		});

		try {
			await this.sequelize.authenticate();
			console.log('Database connection has been established successfully.');
		} catch (error) {
			console.error('Unable to connect to the database:', error);
			process.exit(1);
		}
	}

	async registerModels() {
		if (!this.config.postgres.activate) {
			return this.client.logger.log(chalk.magenta('Database Manager'), chalk.redBright('Postgres config is not active! Models will not be loaded.'));
		}
		const files = await this.client.utils.loadModels();

		for (const arr of files) {
			const [File, name] = arr;
			this.client.logger.log(`Database Manager`, `Loading model ${name}.`);
			try {
				/**
				 * @type {Model}
				 */
				const model = new File(this.client, this);

				if (!(model instanceof Model)) throw new TypeError(`Model ${name} doesn't belong in Models`);

				await model.sync();

				this.models[name] = model;
			} catch (err) {
				this.client.logger.error(err);
				process.exit(1);
			}
			this.client.logger.log('Database Manager', `Loaded model ${name}`);
		}

		this.client.logger.log('Database Manager', `Successfully loaded ${files.length} models.`);
	}

}


module.exports = DatabaseManager;
