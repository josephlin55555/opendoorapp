var express = require('express'); //node.js framework
var bodyParser = require('body-parser'); //node.js parsing middleware

//adds a body object to request; converts from string into JSON
var jsonParser = bodyParser.json();

var app = express();
var port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname));

//renders index.html view upon request
app.get('/api/render', function(request, response) {
  response.render('index');
});

app.get('/api/data', function(request, response) {
  response.json("hi");
});

//client wishes to post data to server; located in request.body
app.post('/api/data', jsonParser, function(request, response) {
  console.log(request.body);
  response.end();
});

app.listen(port, function() {
  console.log('App is running on port ' + port);
});
