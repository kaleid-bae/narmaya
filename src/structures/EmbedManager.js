// eslint-disable-next-line no-unused-vars
const Bot = require('./Bot');
const Embed = require('./Embed');


class EmbedManager {

	/**
     *
     * @param {Bot} client Client
     */
	constructor(client) {
		this.client = client;
	}

	generateEmbed() {
		return new Embed()
			.setColor(this.client.colors.default);
	}

}

module.exports = EmbedManager;
