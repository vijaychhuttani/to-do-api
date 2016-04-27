var express = require('express');
var app = new express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: 'Go home early',
	completed: false
}, {
	id: 2,
	description: 'Eat awesome food',
	completed: true
}, {
	id: 3,
	description: 'Sleep tight',
	completed: false
}];

app.get('/', function(req, res) {
	res.send("To-DO API Route");
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

app.get('/todos/:id', function (req, res) {
	var todoId = req.params.id;
	var todoFound;

	todos.forEach (function(todo){
		if (todo.id == todoId) {
			todoFound = todo;
		}
	});

	if(!todoFound || todoFound === undefined) {
		res.status(404).send();
	} else {
		res.json(todoFound);
	}

});

app.listen(PORT, function () {
	console.log("Express server is now listening on port " + PORT + "...");
})

