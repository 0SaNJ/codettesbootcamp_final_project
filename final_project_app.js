var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";  // "mongodb://localhost:27017/iotstack";

var express = require('express');
var app = express();

// Server Variables
var host = process.env.IP || 'localhost';
var port = process.env.PORT || 8000;

var staticSite = __dirname + '/public';

var mqtt = require('mqtt');

//var client = mqtt.connect([{host:'localhost',port:'9001'}]);
const client = mqtt.connect('ws://192.168.1.18:9001/mqtt');
console.log("Nodejs Server Started!");

// Express middleware to serve static files
app.use(express.static(staticSite));

// Connect to MQTT broker and subscribe to topic
client.on('connect', function () {
  console.log("Connected to MQTT broker");
  client.subscribe('jaysanmo/codettes/01', function (err) {
    if (err) {
      console.error("Failed to subscribe to MQTT topic:", err);
    } else {
      console.log("Subscribed to MQTT topic");
    }
  });
});

// Handle MQTT messages
client.on('message', function (topic, message) {
  console.log("Received message from MQTT:", message.toString());
  json_check(message);
});

// Check if message is JSON
function json_check(data) {
  try {
    var msg = JSON.parse(data.toString());
    console.log("Parsed JSON message:", msg);
    var msgobj = { "msg": msg }; // message object
    Mongo_insert(msgobj);
    console.log("Message object:", msgobj);
  } catch (e) {
    console.log("Message could not be parsed as JSON:", data.toString());
    return false;
  }
}

// Insert data into MongoDB
function Mongo_insert(msg){
  MongoClient.connect(url, function(err, db ) {
    if (err) throw err;
    var dbo = db.db("cb");
    dbo.collection("class").insertOne(msg, function(err, res) {
      if (err) throw err;
      console.log("Data stored in MongoDB:", msg);
      db.close();
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
