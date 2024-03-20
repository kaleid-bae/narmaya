const { Client, Collection, Partials } = require('discord.js');
const Util = require('./Util');
const Logger = require('./Logger');
// eslint-disable-next-line no-unused-vars
const Command = require('./Command');
// eslint-disable-next-line no-unused-vars
const Event = require('./Event');
const EmbedManager = require('./EmbedManager');
const DatabaseManager = require('./DatabaseManager');
const Button = require('./Button');
const SelectMenu = require('./SelectMenu');


class Bot extends Client {

	constructor() {
		super({
			intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildPresences', 'GuildMembers'],
			partials: [Partials.Message, Partials.Reaction, Partials.User, Partials.Channel, Partials.GuildMember],
			allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
		});

		this.config = require('../../data/config.json');

		this.colors = require('../../data/colors.json');

		this.emotes = require('../../data/emotes.json');

		this.server = require('../../data/server.json');

		this.utils = new Util(this);

		this.logger = new Logger(this);

		/**
		 * @type {Collection<string, Command>}
		 */
		this.commands = new Collection();
		/**
		* @type {Collection<string, Event>}
		*/
		this.events = new Collection();

		this.handler = {
			/**
			 * @type {Collection<string, Button>}
			 */
			buttons: new Collection(),
			/**
			 * @type {Collection<string, SelectMenu>}
			 */
			selectMenus: new Collection()
		};

		this.embeds = new EmbedManager(this);

		this.database = new DatabaseManager(this);

		this.maintenance = this.config.maintenance;

		if (this.config.debug) {
			this.on('debug', (message) => this.logger.log('Discord.js Debug', message));
		}
	}

	async boot() {
		await this.utils.loadCommands();
		await this.utils.loadInteractionHandler();
		await this.utils.loadEvents();

		await this.database.connectDatabase();
		await this.database.registerModels();


		await this.login(this.config.token);
	}

	/**
	 * @param {boolean} isConfig
	 */
	uncached(isConfig = false) {
		if (isConfig) {
			delete require.cache[`../../data/config.json`] // config
			this.config = require('../../data/config.json');
			this.maintenance = this.config.maintenance;
		}
		else {
			delete require.cache[`../../data/server.json`] // server
			this.server = require('../../data/server.json');
		}
		
	}
}


module.exports = Bot;
