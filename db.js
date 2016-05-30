var Sequilize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
	sequelize = new Sequilize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequilize(undefined, undefined, undefined, {
		dialect: 'sqlite',
		storage: __dirname + '/data/dev-todo-api-database.sqlite'
	});
}

var db = {};

db.user = sequelize.import(__dirname + '/model/user.js');
db.todo = sequelize.import(__dirname + '/model/todo.js');

db.sequelize = sequelize;
db.Sequilize = Sequilize;
module.exports = db;