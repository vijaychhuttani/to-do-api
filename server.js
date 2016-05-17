var express = require('express');
var app = new express();
var PORT = process.env.PORT || 3000;
var _ = require('underscore');
var db = require('./db.js');

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var todos = [];
var todoNextId = 1;

app.get('/', function(req, res) {
    return res.send("To-DO API Route");
});

//
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
            $like : '%'+queryParams.desc+'%'
        }
    }

    console.log(searchCriteria);

    db.todo.findAll({
        where: searchCriteria
    }).then(function(todos) {
        if(todos.length > 0) {
            todos.forEach(function(todo){
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

    // var filteredTodos = todos;

    // if (queryParams.hasOwnProperty("completed") && queryParams.completed === 'true') {
    //     filteredTodos = _.where(filteredTodos, {
    //         "completed": true
    //     });
    // } else if (queryParams.hasOwnProperty("completed") && queryParams.completed === 'false') {
    //     filteredTodos = _.where(filteredTodos, {
    //         "completed": false
    //     });
    // }

    // if (queryParams.hasOwnProperty("desc") && queryParams.desc.length > 0) {
    //     filteredTodos = _.filter(filteredTodos, function(todo) {
    //         if (todo.description.indexOf(queryParams.desc) > -1) {
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     });
    // }

    // if (filteredTodos.length === 0) {
    //     return res.status(404).send({
    //         "Error": "No such To-Do items found"
    //     });
    // }
    // res.json(filteredTodos);
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

    // if (!_.isBoolean(todo.completed) || !_.isString(todo.description) || todo.description.trim().length === 0) {
    //     return res.status(400).send("Bad data provided");
    // }

    // todo.description = todo.description.trim();
    // todo.id = todoNextId;
    // todoNextId = todoNextId + 1;
    // console.log(todo);
    // todos.push(todo);
    // return res.json(todo);
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

    // var todoFound = _.findWhere(todos, {
    //     id: todoId
    // });
    // if (!todoFound) {
    //     return res.status(404).json({
    //         error: "No to-do item found with id " + todoId
    //     });
    // }
    // return res.json(todoFound);

});

app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id);
    var todoFound = _.findWhere(todos, {
        id: todoId
    });
    if (!todoFound) {
        return res.status(404).json({
            error: "No to-do item found with id " + todoId
        });
    }
    todos = _.without(todos, todoFound);
    return res.json(todoFound);
});

app.put('/todos/:id', function(req, res) {
    var body = req.body;
    var todoId = parseInt(req.params.id);
    var todoFound = _.findWhere(todos, {
        id: todoId
    });
    if (!todoFound) {
        return res.status(404).json({
            error: "No to-do item found with id " + todoId
        });
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

db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log("Express server is now listening on port " + PORT + "...");
    });
});