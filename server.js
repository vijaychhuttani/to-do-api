var express = require('express');
var app = new express();
var PORT = process.env.PORT || 3000;
var _ = require('underscore');
var db = require('./db.js');
var bcryptjs = require('bcryptjs');

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var todos = [];
var todoNextId = 1;

app.get('/', function(req, res) {
    return res.send("To-DO API Route");
});

//GET todo items with query (for description and status) OR all
app.get('/todos', function(req, res) {
    var queryParams = req.query;
    var searchCriteria = {};
    var filteredTodos = [];

    if (queryParams.hasOwnProperty("completed") && queryParams.completed === 'true') {
        searchCriteria.completed = true;
    } else if (queryParams.hasOwnProperty("completed") && queryParams.completed === 'false') {
        searchCriteria.completed = false;
    }

    if (queryParams.hasOwnProperty("desc") && queryParams.desc.length > 0) {
        searchCriteria.description = {
            $like: '%' + queryParams.desc + '%'
        }
    }

    console.log(searchCriteria);

    db.todo.findAll({
        where: searchCriteria
    }).then(function(todos) {
        if (todos.length > 0) {
            todos.forEach(function(todo) {
                //console.log(todo);
                filteredTodos.push(todo.toJSON());
            });
            return res.json(filteredTodos);
        } else {
            return res.status(404).send();
        }
    }).catch(function(e) {
        console.error(e);
        return res.status(500).send(e);
    })
});

//POST new todo items
app.post('/todos', function(req, res) {
    var todo = _.pick(req.body, "description", "completed");

    db.todo.create({
        description: todo.description,
        completed: todo.completed
    }).then(function(todo) {
        console.log(todo);
        res.status(200).json(todo);
    }).catch(function(e) {
        console.log(e);
        res.status(400).json(e);
    });
});

//GET todo items by id
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then(function(todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            return res.status(404).send();
        }
    }).catch(function(e) {
        res.status(500).send(e);
    });
});

//DELETE todo items by id
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function(count) {
        //console.log(todo);
        if (count > 0) {
            res.json({
                rowsDeleted: count
            });
        } else {
            res.status(404).json({
                error: "No to-do item found with id " + todoId
            });
        }
    }).catch(function(e) { 
        res.status(500).send(e);
    });
});

//PUT /todos/:id - Update todo item by id
app.put('/todos/:id', function(req, res) {
    var body = req.body;
    var todoId = parseInt(req.params.id);
    var updateValues = {};

    if (body.hasOwnProperty("completed")) {
        updateValues.completed = body.completed;
    }

    if (body.hasOwnProperty("description")) {
        updateValues.description = body.description;
    }

    console.log(updateValues);

    db.todo.update(
        updateValues, {
            where: {
                id: todoId
            }
        }).then(function(data) {
        //console.log(data); //[1] -> successfully updated, [0] -> no rows updated
        if (data[0] > 0) {
            res.json({
                success: "To-do Item updated successfully."
            });
        } else {
            res.status(404).json({
                error: "No to-do found for update."
            });
        }
    }).catch(function(e) {
        res.status(500).send(e);
    });

});

//POST new Users
app.post('/users', function(req, res) {
    var body = _.pick(req.body, "email", "password");
    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }).catch(function(e) {
        console.log(e);
        res.status(400).json(e);
    });
});

//POST Login users
app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, "email", "password");

    db.user.authenticate(body).then(function(user) {
        return res.json(user.toPublicJSON());
    }, function(e) {
        return res.status(401).send();
    });
});

db.sequelize.sync({
    force: true
}).then(function() {
    app.listen(PORT, function() {
        console.log("Express server is now listening on port " + PORT + "...");
    });
});