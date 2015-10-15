//Initial configuration
var express  = require('express');
var app      = express(); 								// create our app w/ express
var port  	 = process.env.OPENSHIFT_INTERNAL_PORT || 8080; 				//
var ipaddr 	 =  process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

var bodyParser     = require('body-parser');			// To fetch data during posts

//Database
var mongoose = require('mongoose'); 					// mongoose for mongodb
var database = require('./app/config/database'); 			// load the database config
var db = mongoose.connect(database.url);	// connect to mongoDB database on modulus.io





//Middle-tier configuration
app.use(bodyParser.urlencoded({ extended: false }))    // parse application/x-www-form-urlencoded
app.use(bodyParser.json())    // parse application/json


//route file
require('./app/routes/routes.js')(app);


//Start the awesomeness
app.listen( port, ipaddr, function() {	
	console.log('Magic happens on port ', port, ipaddr); 
});
