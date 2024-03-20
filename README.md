
# GBFR Narmaya Bot
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)[![NodeJS](https://img.shields.io/badge/Framework-NodeJS-yellow.svg)](https://choosealicense.com/licenses/mit/)

A brief description of Narmaya Bot Introductionary and Startup Process.


## 🚀 Authors
- [@Pekkapost](https://github.com/Pekkapost) - GBFR Narmaya Bot Creator
- [@Bae](https://github.com/kaleid-bae) - Base Bot & GBFR Narmaya Bot Contributor (with NodeJS)

#### With the help of
- [@Uthsho](https://github.com/Uthsho) - Base Bot Original Creator
- Many user that I can't list one by one, who contributed to the GBFR Resource data! (Author listed within their respective data in `~/data/resource.json` file)


## Installation

#### Setup Configuration

```ml
Configure your bot's token, ownership, and database in
> ~/data/config.json
```

#### How To Run
```bash
npm install
node src/index.js # OR node .
```

#### Deploy Command
##### First Time
```bash
node upload-cmds.js
```
##### Alternatively
```ml
Use the command /restart from the bot
Make sure to toggle the 'refresh-command' option
```

## Handler Guide

#### Important Resource
| Name     | Description                |
| :------- | :------------------------- |
| `~/data/*`   | Configuration and any other related discord bot resources. |
| `~/src/index.js` | Main file to run the command. |
| `~/src/Commands/*` | Slash command resource and logic. |
| `~/src/Events/*` | Discord.js event listener handler. |
| `~/src/InteractionHandler/*` | Non slash command resource and logic. |
| `~/src/Models/*` | Base model for database (based on MariaDB configuration) |
| `~/src/Structures/*` | Main class structure for almost everything you need and customized. |
| `~/src/utils/*` | Other Utilities |

#### Basic Directory Tree
```tree
├── data
│   ├── colors.json
│   ├── config.json
│   ├── config.sample.json
│   ├── emotes.json
│   └── server.json
├── src
│   ├── Commands
│   │   ├── Other
│   │   │   └── test.js
│   │   ├── Owner
│   │   │   ├── eval.js
│   │   │   ├── reload-command.js
│   │   │   └── restart.js
│   │   └── Utilities
│   │       ├── help.js
│   │       └── ping.js
│   ├── Events
│   │   └── client
│   │       ├── button.js
│   │       ├── ready.js
│   │       ├── select-menu.js
│   │       └── slash-command.js
│   ├── InteractionHandler
│   │   ├── Buttons
│   │   │   └── test.js
│   │   └── SelectMenus
│   │       └── test.js
│   ├── Models
│   │   └── sample.js
│   ├── index.js
│   ├── structures
│   │   ├── Bot.js
│   │   ├── Button.js
│   │   ├── Command.js
│   │   ├── DatabaseManager.js
│   │   ├── Embed.js
│   │   ├── EmbedManager.js
│   │   ├── Event.js
│   │   ├── Logger.js
│   │   ├── Model.js
│   │   ├── SelectMenu.js
│   │   └── Util.js
│   └── utils
│       └── misc
│           └── getTime.js
└── upload-cmds.js
```