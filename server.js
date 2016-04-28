var express = require('express');
var app = new express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var todos = [];
var todoNextId = 1;

app.get('/', function(req, res) {
	res.send("To-DO API Route");
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

app.post('/todos', function (req, res) {
	var body = req.body;
	console.log(body);
	var todo = {};
	if(typeof body.description !== 'undefined' && body.description !== null){
		todo.description = body.description;
		if(typeof body.completed !== 'undefined' && body.completed !== null){
			todo.completed = body.completed
		} else {
			todo.completed = false;
		}
		todo.id = todoNextId;
		todos.push(todo);
		todoNextId++;
		res.json(todo);
	} else {
		res.send("Error - Please enter description");
	}
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

