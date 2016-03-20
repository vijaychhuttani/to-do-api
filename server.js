var express = require('express');
var app = new express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: 'Go home early!!!',
	completed: false
}, {
	id: 2,
	description: 'Eat awesome food!!!',
	completed: true
}, {
	id: 3,
	description: 'Sleep tight!!!',
	completed: false
}];

app.get('/', function(req, res) {
	res.send("To-DO API Route");
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

app.listen(PORT, function () {
	console.log("Express server is now listening on port " + PORT + "...");
})

