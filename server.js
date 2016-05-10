var express = require('express');
var app = new express();
var PORT = process.env.PORT || 3000;
var _ = require('underscore');
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var todos = [];
var todoNextId = 1;

app.get('/', function (req, res) {
    return res.send("To-DO API Route");
});

app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    if(queryParams.hasOwnProperty("completed") && queryParams.completed === 'true'){
        filteredTodos = _.where(filteredTodos, {"completed" : true});
    } else if (queryParams.hasOwnProperty("completed") && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {"completed" : false});
    }

    if(filteredTodos.length === 0){
        return res.status(404).send({"Error" : "No such To-Do items found"});
    }
    res.json(filteredTodos);
});

app.post('/todos', function (req, res) {
    var todo = _.pick(req.body, "description", "completed");

    if (!_.isBoolean(todo.completed) || !_.isString(todo.description) || todo.description.trim().length === 0) {
        return res.status(400).send("Bad data provided");
    }

    todo.description = todo.description.trim();
    todo.id = todoNextId;
    todoNextId = todoNextId + 1;
    console.log(todo);
    todos.push(todo);
    return res.json(todo);
});

app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    var todoFound = _.findWhere(todos, {id: todoId});
    if (!todoFound) {
        return res.status(404).json({error: "No to-do item found with id " + todoId});
    }
    return res.json(todoFound);

});

app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    var todoFound = _.findWhere(todos, {id: todoId});
    if (!todoFound) {
        return res.status(404).json({error: "No to-do item found with id " + todoId});
    }
    todos = _.without(todos, todoFound);
    return res.json(todoFound);
});

app.put('/todos/:id', function (req, res) {
    var body = req.body;
    var todoId = parseInt(req.params.id);
    var todoFound = _.findWhere(todos, {id: todoId});
    if (!todoFound) {
        return res.status(404).json({error: "No to-do item found with id " + todoId});
    }

    if (body.hasOwnProperty('completed') && !_.isBoolean(body.completed)) {
        return res.status(400).send("Bad data provided");
    } 

    if (body.hasOwnProperty('description') && !_.isString(body.description) && body.description.trim().length === 0) {
        return res.status(400).send("Bad data provided");
    }

    _.extendOwn(todoFound, body);

    return res.json(todoFound);

});

app.listen(PORT, function () {
    console.log("Express server is now listening on port " + PORT + "...");
});

