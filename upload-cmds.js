const path = require('path');
const { promisify } = require('util');
const { glob } = require('glob');
const Command = require('./src/structures/Command');
const { token, CLIENT_ID } = require('./data/config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const directory = `${path.dirname(require.main.filename)}${path.sep}`;

const cmds = [];

console.log(`Fetching commands.`);
glob(`${directory}/src/Commands/**/*.js`).then(commands => {
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
			console.log(`Error occued while fetching: ${command.name}`);
			console.error(err);
			process.exit(1);
		}
	}

	console.log(`Done fetching: ${cmds.length}`);
	if (cmds.length <= 0) {
		console.error(`No commnds were detected.`);
		process.exit(1);
	}

	const rest = new REST({ version: '9' }).setToken(token);

	(async () => {
		try {
			console.log('Started refreshing application (/) commands.');
			await rest.put(
				Routes.applicationCommands(CLIENT_ID),
				{ body: cmds }
			);

			console.log('Successfully reloaded application (/) commands.');
		} catch (error) {
			console.error(error);
		}
	})();
}).catch(err => {
	console.error(err);
	process.exit(1);
});
