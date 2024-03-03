var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";  // "mongodb://localhost:27017/iotstack";


var express = require('express');
var app = express();

//Server Variables
var host = process.env.IP || 'localhost';
var port = process.env.PORT || 9000;

var staticSite = __dirname + '/.';

var mqtt = require('mqtt')

var client  = mqtt.connect([{host:'localhost',port:'1883'}]) //var client  = mqtt.connect([{host:'broker.hivemq.com',port:'1883'}]) //
 console.log("Nodejs Server Started!");
 
// on mqtt conect subscribe on tobic test 
client.on('connect', function () {
  client.subscribe('jaysanmo/codettes/01', function (err) {
	 console.log("sub scribing to test topic");
      if(err)
      console.log(err)
  })
})

 //when recive message 
client.on('message', function (topic, message) {
  json_check(message)
})

//check if data json or not
function json_check(data) {
    try {
       // JSON.parse(data);
	 msg = JSON.parse(data.toString()); // t is JSON so handle it how u want
    } catch (e) {
		console.log("message could not valid json " + data.toString);
        return false;
    }
	 console.log(msg);
	 var msgobj = { "msg": msg }; // message object
    Mongo_insert(msgobj)
	console.log(msgobj);
}

//insert data in mongodb
function Mongo_insert(msg){
MongoClient.connect(url, function(err, db ) {
    if (err) throw err;
    var dbo = db.db("cb");
    dbo.collection("class").insertOne(msg, function(err, res) {
      if (err) throw err;
	   console.log("data stored");
      //db.close();
    });
  }); 
}

// ENABLE CORS for Express (so swagger.io and external sites can use it remotely .. SECURE IT LATER!!)
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


app.use('/', express.static(staticSite));
// Use router for all /api requests


if (! process.env.C9_PID) {
    console.log('Running at http://'+ host +':' + port);
}
app.listen(port, function() { console.log('Listening')});
