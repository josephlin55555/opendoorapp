var express = require('express'); //node.js framework
var bodyParser = require('body-parser'); //node.js parsing middleware

var app = express();
var port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname));

app.listen(port, function() {
  console.log('App is running on port ' + port);
});
