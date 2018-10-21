const express = require('express')
const app = express()
var bodyParser = require('body-parser');
const port = process.env.PORT || 3000
var cors = require('cors')
const corsOptions = {
  origin: '*',
  methods: 'GET,PUT,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// database integration
const dburi = "mongodb+srv://sateendradey:WordPass1990!@cluster0-wgoht.mongodb.net/test?retryWrites=true";
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
var db;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.json());

app.get('/', (req, res) => res.send('Hello World!'))
// beacon end points

app.post('/createbeacon', function (req, res) {
    var dateTime = getCurrDateTime();
   const new_beacon = {
       title: req.body.title,
       desc: req.body.desc,
       locdesc: req.body.locdesc,
       lat: req.body.lat,
       lon: req.body.lon,
       time: dateTime,
       uname: req.body.uname,
       lnd: req.body.lnd,
       do_uname:'X',
       color:'none',
       status: '0' 
   };
    CreateBeacon(new_beacon, function(response){
	   console.log(response);
        res.send(response);
    });
});

//complete beacon
app.post('/completebeacon', function (req, res) { 
    CompleteBeacon(req.body, function(response){
	   console.log(response);
        res.send(response);
    });
});

//user end points
//to get user's profile
app.get('/profile/:id', function (req, res) {
    var prof_id = req.params.id;
    //request.query : for query string params
    //res.send(getProfile(prof_id));
    getProfile("amitr", function(response){
	   console.log(response);
        res.send(response);
    });
});

// get active becons nearby
app.get('/activebeacons', function (req, res) {
     GetBeacon(function(response){
	   console.log(response);
        res.send(response);
    });
});
//get in progress beacons
app.get('/progressbeacons', function (req, res) {
     GetBeacon_inProgress(function(response){
	   console.log(response);
        res.send(response);
    });
});


//to create users profile
app.post('/profile', function (req, res) {
    dateTime = getCurrDateTime();
   const new_prof = {
       uname: req.body.uname, // username: email
       pass:req.body.pass, // password
       name: req.body.name, // name
       gate: 'X', // gate no
       phn: req.body.phn, // phone
       airl: 'NoAirline', // airline
       lat:'0',
       lon:'0',
       lasttime:dateTime,
       credits:0,
       stat:'1'
   };     
    AddProfile(new_prof,function(response){
	   console.log(response);
        res.send(response);
    });
    
});

//to login: capture current location and login time
app.post('/login', function(req, res){
    processLogin(req.body,function(response){
       console.log(response);
        res.send(response);    
    });
});

// Accept beacon
app.post('/beaconaccept', function(req, res){
    acceptBeacon(req.body,function(response){
       console.log(response);
        res.send(response);    
    });
});

app.post('/inc',function(req, res){
    increaseCredit('amitr',function(response){
       console.log(response);
        res.send(response);    
    });
});


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

function GetBeacon_inProgress(callback){
    var res;
    var dbo = db.db("Beacon_DB");
    var searchTerm = { status: "1" };
   	console.log(searchTerm);
    dbo.collection("Beacons").find(searchTerm).toArray(function(err, result) {
        if (err) throw err;
        res =  result;
        return callback(res);
    });
}


function CreateBeacon(new_beacon, callback){
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

function processLogin(body_obj,callback){
    // pass lat, lon, airl, gate
  var dbo = db.db("User_DB");
  var myquery = { uname: body_obj.uname };
  var dateTime = getCurrDateTime();  
  var newvalues = { $set: {lasttime: dateTime, lat: body_obj.lat, lon:body_obj.lon, airl:body_obj.airl,  gate:body_obj.gate} };
  dbo.collection("Details_Cols").updateOne(myquery, newvalues, function(err, res) {
    if (err) {callback("fail")}
    console.log("1 document updated");
      callback("Success");
  });
}

function acceptBeacon(body_obj,callback){
    // pass bid, do_uname
    var dbo = db.db("Beacon_DB");
    var color = getRandomColor();
    var o_id = new mongo.ObjectID(body_obj.bid );
    var myquery = { _id: o_id};
    var dateTime = getCurrDateTime();  
    var newvalues = { $set: {do_uname: body_obj.do_uname, status:'1', color:color} };
    dbo.collection("Beacons").updateOne(myquery, newvalues, function(err, res) {
        if (err) {callback("fail")}
        console.log("1 document updated");
          callback("Success");
      });
}

function CompleteBeacon(body_obj,callback){
    // pass bid, do_uname
    var dbo = db.db("Beacon_DB");
    var o_id = new mongo.ObjectID(body_obj.bid );
    var myquery = { _id: o_id};
    var dateTime = getCurrDateTime();
    increaseCredit(body_obj.do_uname);
    var newvalues = { $set: {do_uname: body_obj.do_uname, status:'2',color:'none'} };
    dbo.collection("Beacons").updateOne(myquery, newvalues, function(err, res) {
        if (err) {callback("fail")}
        console.log("1 document updated");
          callback("Success");
      });
}

function increaseCredit(user_id){
    var dbo = db.db("User_DB");
    var myquery =  { uname: user_id };
    var dateTime = getCurrDateTime();  
    var newvalues = {$inc:{"credits":1}};
    dbo.collection("Details_Cols").updateOne(myquery, newvalues, function(err, res) {
        if (err) {console.log("fail");return "fail";}
        else{
        console.log("1 document updated");
          return "Success";
        }
      });
}

function getRandomColor(){
    return 'green';
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

function getCurrDateTime(){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    return dateTime;
}


//function sendNotification(beacon,callback){}

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
