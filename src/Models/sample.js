/* eslint-disable camelcase */
/**
 * This is an example file of models
 * Please delete or modify this file if you used the postgress database
 * This is based on MariaDB DB structure.
 */


const Model = require('../structures/Model');
const { DataTypes, Op } = require('sequelize');

module.exports = class extends Model {

	constructor(...args) {
		super('sample', {
			user: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			age: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            birthdate: {
                type: DataTypes.DATE,
                allowNull: true
            }
		}, ...args);
	}

	async findUsers(str) {
		const result = await this.model.findAll({
			where: {
				user: {
                    [Op.like]: `%${str}%`
                }
			},
			order: [
				['createdAt', 'ASC']
			]
		});

		return result;
	}

    async findUser(user) {
        const result = await this.model.findOne({
			where: {
				user
			}
		});

		return result;
    }

	async createUser(values = {}) {
		const user = await this.model.create({
			...values,
		});
		return user;
	}

	async getAllUser() {
		const result = await this.model.findAll();

		return result;
	}

};
