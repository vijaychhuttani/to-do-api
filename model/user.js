var bcryptjs = require('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 30]
			},
			set: function(value) {
				var salt = bcryptjs.genSaltSync(10);
				var hashedPassword = bcryptjs.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, option) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcryptjs.compareSync(body.password, user.get('password_hash'))) {
							return reject();
						}
						return resolve(user);
					}).catch(function(e) {
						console.log(e);
						return reject();
					});
				});
			},
			findByToken: function(token) {
				return new Promise(function(resolve, reject) {
					try {
						var decodedJWT = jwt.verify(token, 'qwerty007');
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, '@AHOOOOOGA#!');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function(user) {
							if(user){
								return resolve(user);
							} else {
								return reject();
							}
						}, function(e) {
							throw e;
						});
					} catch (e) {
						return reject();
					}
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'updatedAt', 'createdAt');
			},
			generateToken: function(type) {
				if (!_.isString(type)) {
					return undefined;
				}

				try {
					var stringData = JSON.stringify({
						id: this.get('id'),
						type: type
					});
					var encryptedData = cryptojs.AES.encrypt(stringData, '@AHOOOOOGA#!').toString();
					var token = jwt.sign({
						token: encryptedData,
					}, 'qwerty007');
					return token;
				} catch (e) {
					console.error(e);
					return undefined;
				}
			}
		}
	});
	return user;
}