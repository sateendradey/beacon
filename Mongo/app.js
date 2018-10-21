const express = require('express')
const app = express()
var bodyParser = require('body-parser');
const port = process.env.PORT || 3000


// database integration
const dburi = "mongodb+srv://sateendradey:WordPass1990!@cluster0-wgoht.mongodb.net/test?retryWrites=true";
const MongoClient = require('mongodb').MongoClient;
var db;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.json());

var profiles = [
    {
        "Name": "Amit1",
        "Terminal": "B",
        "GateNumber": "26",
        "Airlines":"American"
    },
    {
        "Name": "Amit2",
        "Terminal": "C",
        "GateNumber": "26",
        "Airlines":"American"
    }
];


var beacons = [];

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/profile/:id', function (req, res) {
    var prof_id = req.params.id;
    //request.query : for query string params
    //res.send(getProfile(prof_id));
    getProfile("amitr", function(response){
	   console.log(response);
        res.send(response);
    });
});

app.get('/beacon', function (req, res) {
    //var bec_id = req.params.id;
    //res.send(GetBeacon(bec_id));
    GetBeacon(function(response){
	   console.log(response);
        res.send(response);
    });
});

app.post('/profile', function (req, res) {
   const new_prof = {
       uname: req.body.uname, // username
       pass:req.body.pass, // password
       name: req.body.name, // name
       gate: req.body.gate, // gate no
       phn: req.body.phn, // phone
       airl: req.body.airl, // airline
       lat:req.body.lat,
       lon:req.body.lon,
       stat:'1'
   };     
    AddProfile(new_prof,function(response){
	   console.log(response);
        res.send(response);
    });
    
});

app.post('/beacon', function (req, res) {
   const new_beacon = {
       desc: req.body.desc,
       loc: req.body.loc,
       time: req.body.time,
       userid: req.body.userid,
       status: '0' 
   };
    CreateBeacon(new_beacon, function(response){
	   console.log(response);
        res.send(response);
    });
});

app.post('/login', function(req, res){
    
});

function getProfile(prof_id){
    return profiles[prof_id];
}

function AddProfile(new_prof, callback){
var dbo = db.db("User_DB");
  dbo.collection('Details_Cols').insertOne(new_prof, function (err, result) {
      if (err)
         return callback('Error');
      else
        return callback('Success');

  });
}

function GetBeacon(callback){
    var res;
    var dbo = db.db("Beacon_DB");
    var searchTerm = { status: "0" };
   	console.log(searchTerm);
    dbo.collection("Beacons").find(searchTerm).toArray(function(err, result) {
        if (err) throw err;
        res =  result;
        return callback(res);
    });
}

function CreateBeacon(new_beacon, callback){
    console.log("in beacon post");
   var dbo = db.db("Beacon_DB");
  dbo.collection('Beacons').insertOne(new_beacon, function (err, result) {
      if (err)
         return callback('Error');
      else
        return callback('Success');
  });
}

function getProfile(user_id, callback) {
	var res;
    var dbo = db.db("User_DB");
    var searchTerm = { uname: user_id };
   	console.log(searchTerm);
    dbo.collection("Details_Cols").find(searchTerm).toArray(function(err, result) {
        if (err) throw err;
        res =  result;
        return callback(res[0]);
    });
}

function processLogin(userid, callback){
  var dbo = db.db("mydb");
  var myquery = { address: "Valley 345" };
  var newvalues = { $set: {name: "Mickey", address: "Canyon 123" } };
  dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  });
}

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}

MongoClient.connect(dburi, function (err, database) {
   if (err) 
   	throw err
   else
   {
	db = database;
	console.log('Connected to MongoDB');
	//Start app only after connection is ready
	app.listen(port, () => console.log(`App listening on port ${port}!`))
   }
 });