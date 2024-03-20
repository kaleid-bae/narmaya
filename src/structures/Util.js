// eslint-disable-next-line no-unused-vars
const Bot = require('./Bot');
const path = require('path');
const { promisify } = require('util');
const { glob } = require('glob');
const Event = require('./Event');
const Command = require('./Command');
// eslint-disable-next-line no-unused-vars
const { Message, User, GuildMember, TextChannel, NewsChannel, Role, Guild, ActionRowBuilder, ButtonBuilder, ActionRow, ButtonStyle, REST, Routes, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const Button = require('./Button');
const SelectMenu = require('./SelectMenu');


module.exports = class Util {

	constructor(client) {
		/**
         * @type {Bot}
         */
		this.client = client;
	}

	isEmpty(obj) {
		return Object.keys(obj).length === 0;
	}

	extract(input) {
		// eslint-disable-next-line no-useless-escape
		var elements = input.split(/([^\']\S*|\'.+?\')\s*/),
			matches = [];
		for (const index in elements) {
			if (elements[index].length > 0) {
				if (elements[index].charAt(0) === "'") {
					matches.push(elements[index].substring(1, elements[index].length - 1));
				} else {
					matches.push(elements[index]);
				}
			}
		}
		return matches;
	}

	isClass(input) {
		return typeof input === 'function' &&
        typeof input.prototype === 'object' &&
        input.toString().substring(0, 5) === 'class';
	}

	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`;
	}

	trimArray(arr, maxLen = 10) {
		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`${len} more...`);
		}
		return arr;
	}

	formatBytes(bytes) {
		if (bytes === 0) return '0 Bytes';
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
	}

	removeDuplicates(arr) {
		return [...new Set(arr)];
	}

	capitalise(string) {
		return string.split(' ').map(str => str.slice(0, 1).toUpperCase() + str.slice(1)).join(' ');
	}

	checkOwner(target) {
		return this.client.config.owners.includes(target);
	}

	checkAdmin(target) {
		return this.client.config.admins.includes(target);
	}

	comparePerms(member, target) {
		return member.roles.highest.position < target.roles.highest.position;
	}

	formatPerms(perm) {
		return perm
			.toLowerCase()
		// eslint-disable-next-line id-length
			.replace(/(^|"|_)(\S)/g, (s) => s.toUpperCase())
			.replace(/_/g, ' ')
			.replace(/Guild/g, 'Server')
			.replace(/Use Vad/g, 'Use Voice Activity');
	}

	formatArray(array, type = 'conjunction') {
		return new Intl.ListFormat('en-GB', { style: 'short', type: type }).format(array);
	}

	async loadCommands() {
		return glob(`${this.directory}/Commands/**/*.js`).then(commands => {
			for (const commandFile of commands) {
				delete require.cache[commandFile];
				const { name } = path.parse(commandFile);
				const File = require(commandFile);
				if (!this.isClass(File)) throw new TypeError(`Command ${name} doesn't export a class.`);
				const command = new File(this.client);
				if (!(command instanceof Command)) throw new TypeError(`Comamnd ${name} doesnt belong in Commands.`);

				this.client.commands.set(command.name.toLowerCase(), command);
			}
		}).catch(err => {
			this.client.logger.error(err);
			throw err;
		});
	}

	async loadEvents() {
		return glob(`${this.directory}/Events/**/*.js`).then(events => {
			for (const eventFile of events) {
				delete require.cache[eventFile];
				const { name } = path.parse(eventFile);

				const File = require(eventFile);
				if (!this.isClass(File)) throw new TypeError(`Event ${name} doesn't export a class!`);
				const event = new File(this.client);
				if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in Events`);
				this.client.events.set(event.name, event);
				if (event.disabled) continue;
				event.emitter[event.type](event.event, (...args) => event.run(...args));
			}
		}).catch(err => {
			console.log(err);
			process.exit(1);
		});
	}

	async loadModels() {
		return glob(`${this.directory}/Models/**/*.js`).then(events => {
			const results = [];

			for (const eventFile of events) {
				delete require.cache[eventFile];

				const { name } = path.parse(eventFile);

				const file = require(eventFile);

				results.push([file, name]);
			}

			return results;
		}).catch(err => {
			console.log(err);
			process.exit(1);
		});
	}

	async loadInteractionHandler() {
		return glob(`${this.directory}/InteractionHandler/**/*.js`).then(interactions => {
			for (const interactionFile of interactions) {
				delete require.cache[interactionFile];
				const { name } = path.parse(interactionFile);
				const File = require(interactionFile);
				if (!this.isClass(File)) throw new TypeError(`Interaction Handler ${name} doesn't export a class.`);
				const interaction = new File(this.client);
				if (!(interaction instanceof Button) && !(interaction instanceof SelectMenu)) throw new TypeError(`Interaction Handler ${name} doesnt belong in any Interaction Handler class.`);

				if ((interaction instanceof Button)) this.client.handler.buttons.set(interaction.id, interaction);
				else if ((interaction instanceof SelectMenu)) this.client.handler.selectMenus.set(interaction.id, interaction);
			}
		}).catch(err => {
			this.client.logger.error(err);
			throw err;
		});
	}

	async uploadCommands() {
		const cmds = [];
		console.log(`Fetching commands.`);

		try {
			const commands = await glob(`${this.directory}/Commands/**/*.js`);

			for (const commandFile of commands) {
				delete require.cache[commandFile];
				const { name } = path.parse(commandFile);
				const File = require(commandFile);
				const command = new File(null);
				if (!(command instanceof Command)) throw new TypeError(`Comamnd ${name} doesnt belong in Commands.`);
		
				if (!command.builder) {
					throw new Error(`Command ${name} has no builder configured.`);
				}
		
				try {
					cmds.push(command.builder.toJSON());
				} catch (err) {
					console.log(`Error occured while fetching: ${command.name}`);
					console.error(err);
					return false;
				}
			}
		
			console.log(`Done fetching: ${cmds.length}`);
			if (cmds.length <= 0) {
				console.error(`No commands were detected.`);
				return true;
			}
		
			const rest = new REST({ version: '9' }).setToken(this.client.token);

			try {
				console.log('Started refreshing application (/) commands.');
				await rest.put(
					Routes.applicationCommands(this.client.config.CLIENT_ID),
					{ body: cmds }
				);

				console.log('Successfully reloaded application (/) commands.');
			}	catch (error) {
				console.error(error);
				return false;
			}
			return true;
		}
		catch (error) {
			console.error(error);
			return false;
		}
	}

	nthNumber(number) {
		return `${number}${nth(number)}`;
	}

	formatNumber(number) {
		const nf = new Intl.NumberFormat();
		return nf.format(number);
	}

	makeId(length) {
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
	checkBadString(str = '') {
		// eslint-disable-next-line no-useless-escape
		const regex = /^[^a-zA-Z0-9\[\]\(\)\{\}\! +]/;

		return str.match(regex);
	}

	checkBadHoist(str = '') {
		const regex = /[^a-zA-Z0-9]/;

		return (str[0] || '').match(regex);
	}

	convertBytes(bytes) {
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

		if (bytes === 0) {
			return 'n/a';
		}

		const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

		if (i === 0) {
			return `${bytes} ${sizes[i]}`;
		}

		return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
	}
	/**
	 *
	 * @param {string} search Search
	 * @returns {Promise<User>}
	 */
	async resolveUser(search) {
		let user = null;
		if (!search || typeof search !== 'string') return;
		// Try ID search
		if (search.match(/^<@!?(\d+)>$/)) {
			const id = search.match(/^<@!?(\d+)>$/)[1];
			// eslint-disable-next-line no-empty-function
			user = await this.client.users.fetch(id).catch(() => {});
			// eslint-disable-next-line consistent-return
			if (user) return user;
		}
		// Try username search
		if (search.match(/^!?(\w+)#(\d+)$/)) {
			const username = search.match(/^!?(\w+)#(\d+)$/)[0];
			const discriminator = search.match(/^!?(\w+)#(\d+)$/)[1];
			// eslint-disable-next-line id-length
			user = this.client.users.cache.find((u) => u.username === username && u.discriminator === discriminator);
			// eslint-disable-next-line consistent-return
			if (user) return user;
		}
		// eslint-disable-next-line no-empty-function
		user = await this.client.users.fetch(search).catch(() => {});
		// eslint-disable-next-line consistent-return
		return user;
	}

	/**
	 *
	 * @param {string} search Search
	 * @param {Guild} guild Guild
	 * @returns {Promise<GuildMember>}
	 */
	async resolveMember(search, guild) {
		let member = null;
		if (!search || typeof search !== 'string') return null;
		// Try ID search
		if (search.match(/^<@!?(\d+)>$/)) {
			const id = search.match(/^<@!?(\d+)>$/)[1];
			// eslint-disable-next-line no-empty-function
			member = await guild.members.fetch(id).catch(() => {});
			// eslint-disable-next-line consistent-return
			if (member) return member;
		}
		// eslint-disable-next-line no-empty-function
		member = await guild.members.fetch(search).catch(() => {});
		// eslint-disable-next-line consistent-return
		return member;
	}

	/**
	 *
	 * @param {string} search Search
	 * @param {Guild} guild Guild
	 * @returns {Promise<Role>}
	 */
	async resolveRole(search, guild) {
		let role = null;
		if (!search || typeof search !== 'string') return null;
		// Try ID search
		if (search.match(/^<@&!?(\d+)>$/)) {
			const id = search.match(/^<@&!?(\d+)>$/)[1];
			role = guild.roles.cache.get(id);
			// eslint-disable-next-line consistent-return
			if (role) return role;
		}
		// Try name search
		// eslint-disable-next-line id-length
		role = guild.roles.cache.find((r) => search === r.name);
		// eslint-disable-next-line consistent-return
		if (role) return role;
		role = guild.roles.cache.get(search);
		// eslint-disable-next-line id-length
		if (!role) role = guild.roles.cache.find(r => r.name.startsWith(search));
		// eslint-disable-next-line consistent-return
		return role;
	}

	/**
	 *
	 * @param {string} search Search
	 * @param {Guild} guild Guild
	 * @returns {Promise<TextChannel|NewsChannel>}
	 */
	async resolveChannel(search, guild) {
		let channel = null;
		if (!search || typeof search !== 'string') return;
		// Try ID search
		if (search.match(/^<#?(\d+)>$/)) {
			const id = search.match(/^<#?(\d+)>$/)[1];
			channel = guild.channels.cache.get(id);
			// eslint-disable-next-line consistent-return
			if (channel) return channel;
		}

		channel = await guild.channels.cache.get(search);
		// eslint-disable-next-line consistent-return
		return channel;
	}

	/**
	 *
	 * @param {GuildMember} member Member
	 * @returns {string}
	 */
	getMemberAvatar(member) {
		const { user } = member;
		return member.avatarURL({ format: 'png', dynamic: true }) || user.avatarURL({
			format: 'png',
			dynamic: true
		}) || user.defaultAvatarURL;
	}

	cancelButton() {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Cancel')
					.setCustomId('cancel')
					.setStyle(ButtonStyle.Danger)
			);
		return row;
	}

	testButton() {
		const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setLabel('Test')
				.setCustomId('button_test')
				.setStyle(ButtonStyle.Success)
		);

		return row;
	}

	testSelectMenu() {
		const row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('select_test')
				.setPlaceholder('Select one of the test content!')
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel('Test 1')
						.setValue("Hello world!"),
					new StringSelectMenuOptionBuilder()
						.setLabel('Test 2')
						.setValue("How are you today?")
				)
		)
		
		return row;
	}

	/**
	 * @param {string} character
	 * @param {number} key_value
	 */
	getCharacterBuildSelection(character, key_value) {
		const char_builds = this.client.resource.charbuild[character];
		let options = [];
		for (const [key, value] of Object.entries(char_builds)) {
			options.push(new StringSelectMenuOptionBuilder()
				.setLabel(`${value.title || "Title"}`)
				.setValue(`${key || "1"}`)
				.setDefault(key == `${key_value}` || false)
			)
		};

		const row = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(`build_${character}`)
				.setPlaceholder('Select one of the provided character build!')
				.addOptions(...options)
		)
		
		return row;
	}

	/**
	 * @param {string} character
	 * @param {number} key
	 */
	getCharacterBuildEmbed(character, key) {
		const embed = this.client.embeds.generateEmbed().setDescription("No build found...");
		const char_build = this.client.resource.charbuild[character][key];
		const char_image = this.client.resource.characters[character]?.image;

		if (char_image) embed.setThumbnail(char_image);
		if (char_build) {
			embed.setTitle(char_build?.title || "Unknown Build")
			.setDescription(char_build?.notes || "-")
			.setImage(char_build?.link)
			.setColor("Random");
		}

		return embed;
	}

	/**
	 *
	 * @param {Message} message Message
	 * @param {User} user User
	 * @param {MessageActionRow} row Row
	 * @param {number} time Time
	 * @returns {Message}
	 */
	async awaitResponse(message, user, row, time) {
		return new Promise((resolve, reject) => {
			row.components = row.components.map(button => button.setDisabled(true));
			const collector = message.channel.createMessageCollector({
				filter: (msg) => msg.author.id === user.id && (msg.content || '').length,
				time: 10 * 60000,
				max: 1
			});

			collector.on('collect', (msg) => {
				resolve(msg);
			});

			collector.on('end', async (_e, reason) => {
				await message.edit({ components: [row] }).catch(() => {
					// .
				});

				if (!interactionCollector.ended) interactionCollector.stop();

				if (reason === 'time') reject();
			});

			const interactionCollector = message.createMessageComponentCollector({
				time,
				max: 1,
				filter: (interaction) => interaction.customId === 'cancel' && interaction.user.id === user.id
			});

			interactionCollector.on('collect', async (interaction) => {
				await interaction.deferUpdate().catch(() => {
					// .
				});

				collector.stop('time');
			});

			interactionCollector.on('end', (_e, reason) => {
				if (reason === 'time') {
					collector.stop('time');
				}
			});
		});
	}

	/**
	 *
	 * @param {Message} message Message
	 * @param {number} timeout Timeout
	 */
	deleteMessage(message, timeout) {
		if (!timeout) {
			if (message.channel) {
				message.delete().catch(() => {
					// .
				});
			}
		} else {
			setTimeout(() => {
				if (message.channel) {
					message.delete().catch(() => {
					// .
					});
				}
			}, timeout);
		}
	}

	formatTime(ms) {
		const time = parseMilliseconds(ms);

		let text = '';

		if (time.days) text += `**${time.days}** day(s) `;

		if (time.hours) text += `**${time.hours}** hour(s) `;

		if (time.minutes) text += `**${time.minutes}** minute(s) `;

		if (time.seconds) text += `**${time.seconds}** second(s)`;

		if (!text.length) text = '**0** seconds';

		return text;
	}

};

// eslint-disable-next-line id-length
function nth(n) {
	// eslint-disable-next-line no-mixed-operators
	return ['st', 'nd', 'rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th';
}

function parseMilliseconds(milliseconds) {
	if (typeof milliseconds !== 'number') {
		throw new TypeError('Expected a number');
	}

	const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

	return {
		days: roundTowardsZero(milliseconds / 86400000),
		hours: roundTowardsZero(milliseconds / 3600000) % 24,
		minutes: roundTowardsZero(milliseconds / 60000) % 60,
		seconds: roundTowardsZero(milliseconds / 1000) % 60,
		milliseconds: roundTowardsZero(milliseconds) % 1000,
		microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
		nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000
	};
}
