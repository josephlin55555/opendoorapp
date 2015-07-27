var express = require('express'); //node.js framework
var bodyParser = require('body-parser'); //node.js parsing middleware
var mongoose = require('mongoose');

var uriString = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/opendoorapp';

mongoose.connect(uriString, function(error, response) {
  if(error) {
    console.log('Error connecting to: ' + uriString + '. ' + error);
  } else {
    console.log('Succeeded connection to: ' + uriString);
  }
});

var winnerSchema = new mongoose.Schema({
  winners: Number
});

var WinnerModel = mongoose.model('Winners', winnerSchema);

var app = express();
var port = process.env.PORT || 3000; 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.post('/api/winners', function(request, response) {
  
  WinnerModel.find({}).exec(function(error, result) {
    if(error) {
      console.log('Database retrieval error');
    } else {
      console.log('database result', result);
      
      var winnerData = new WinnerModel({
        winners: 1
      });
      winnerData.save(function(error) {
        if(error) {
          console.log('Error on save');
        }
      });
    }
  });

  console.log('request', request.body);
  response.end();
});

app.get('/api/winners', function(request, response) {
  WinnerModel.find({}).exec(function(error, result) {
    response.json(result.length);
  });
});


app.set('view engine', 'ejs');
app.use(express.static(__dirname));

app.listen(port, function() {
  console.log('App is running on port ' + port);
});
