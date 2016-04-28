var express = require('express');
var app = new express();
var PORT = process.env.PORT || 3000;
var _ = require('underscore');
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var todos = [];
var todoNextId = 1;

app.get('/', function (req, res) {
    res.send("To-DO API Route");
});

app.get('/todos', function (req, res) {
    res.json(todos);
});

app.post('/todos', function (req, res) {
    var todo = _.pick(req.body, "description", "completed");

    if (!_.isBoolean(todo.completed) || !_.isString(todo.description) || todo.description.trim().length === 0) {
        res.status(400).send("Bad data provided");
    } else {
        todo.description = todo.description.trim();
        todo.id = todoNextId;
        todoNextId = todoNextId + 1;
        console.log(todo);
        todos.push(todo);
        res.json(todo);
    }
});

app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    var todoFound = _.findWhere(todos, {id: todoId});
    if (!todoFound || todoFound === undefined) {
        res.status(404).send("No to-do item found with id " + todoId);
    } else {
        res.json(todoFound);
    }

});

app.listen(PORT, function () {
    console.log("Express server is now listening on port " + PORT + "...");
});

