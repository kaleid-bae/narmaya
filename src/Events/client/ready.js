const { Events } = require('discord.js');
const Event = require('../../structures/Event');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const chalk = require('chalk');

module.exports = class extends Event {

	constructor(...args) {
		super(
			...args,
			{
				name: "Client Ready",
				event: Events.ClientReady,
				once: true,
			}
		);
	}

	async run() {
		const date = new Date();

		const loaded = [
			`Logged in as ${this.client.user.tag}`,
			`Loaded ${this.client.commands.size} commands!`,
			`Loaded ${this.client.events.size} events!`,
			`Loaded ${this.client.handler.buttons.size} button handlers!`,
			`Loaded ${this.client.handler.selectMenus.size} select menu handlers!`,
			`____________________________`,
			`Loaded ${this.client.guilds.cache.size} guilds!`,
			`Loaded ${this.client.users.cache.size} users!`,
			`Date: ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
		].join('\n');

		console.log(chalk.blue(loaded));

		// Removed command slash check since It will spam discord API every on ready event. 
		// this.checkSlash();
	}

	async checkSlash() {
		this.client.logger.log(`Slash Commands`, `Checking slash commands for changes.`);
		const fetched = await this.client.application.commands.fetch()
			.then(cache => [...cache.values()]);

		const commands = [...this.client.commands.values()];

		const cmds = commands.map(cmd => cmd.builder.toJSON());

		let updateRequired = false;

		for (const command of fetched) {
			const exists = commands.find(cmd => cmd.name === command.name);

			if (!exists) {
				updateRequired = true;
				break;
			}

			const changes = exists.isChanged(command);
			console.log(`${command.name} Command JSON`, command.toJSON());
			console.log(`${exists.name} Fetched JSON :`, exists.builder.toJSON())
			console.log(`${exists.name} Is Changed :`, changes);

			if (changes) {
				updateRequired = true;
				break;
			}
		}
		
		const uploadRequired = commands.some(cmd => !fetched.find(cache => cache.name === cmd.name));
		
		console.log("Update Required", updateRequired);
		console.log("Upload Required", uploadRequired);

		if (!uploadRequired && !updateRequired) {
			this.client.logger.log('Slash Commands', 'Detected no changes to slash commands.');
			return;
		}

		// this.client.logger.log('Slash Commands', 'Detected Changes to slash commands. Preparing to upload.');

		// this.client.logger.log('Slash Commands', `Uploading slash commands to Discord API.`);

		// try {
		// 	await this.client.application.commands.set(cmds);
		// } catch (err) {
		// 	this.client.logger.error('Slash Commands', 'Failed to upload slash commands.');
		// 	console.error(err);
		// 	return;
		// }

		this.client.logger.log('Slash Commands', 'Successfully uploaded slash commands to Discord API.');
	}

};
