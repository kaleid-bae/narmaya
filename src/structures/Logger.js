const chalk = require('chalk');
// eslint-disable-next-line no-unused-vars
const Bot = require('./Bot');

class Logger {

	constructor(client) {
		/**
		 * @type {Bot}
		 */
		this.client = client;
	}

	get isDebug() {
		return this.client.config.debug;
	}

	send(...args) {
		if (!this.isDebug) return false;
		// eslint-disable-next-line consistent-return
		console.log(chalk.red('[Logger]- '), ...args);

		return true;
	}

	get id() {
		return 0;
	}

	debug(title, message) {
		console.log(chalk.yellow.dim(`[Process ${process.pid}] [Cluster ${this.id}] [${title}] ${message}`));
	}

	log(title, message) {
		console.log(chalk.green.dim(`[Process ${process.pid}] [Cluster ${this.id}] [${title}] ${message}`));
	}

	error(...err) {
		console.error(chalk.red.dim(`[Process ${process.pid}] [Cluster ${this.id}]`, ...err.map(err2 => err2.stack || err2)));
	}

}

module.exports = Logger;
