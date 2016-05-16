var Sequilize = require('sequelize');
var sequelize = new Sequilize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/data/dev-todo-api-database.sqlite'
});

var db = {};

db.todo = sequelize.import(__dirname + '/model/todo.js');
db.sequelize = sequelize;
db.Sequilize = Sequilize;
module.exports = db;