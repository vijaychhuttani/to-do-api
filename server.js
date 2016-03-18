var express = require('express');
var app = new express();
var PORT = process.env.PORT || 3000;

app.get('/', function(req, res) {
	res.send("To-DO API Route");
});

app.listen(PORT, function () {
	console.log("Express server is now listening on port " + PORT + "...");
})

