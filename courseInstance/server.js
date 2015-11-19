//Initial configuration
var express  = require('express');
var app      = express(); 								// create our app w/ express
var port  	 = process.env.OPENSHIFT_INTERNAL_PORT || 9082; 				//
var ipaddr 	 =  process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

//Database
var mongoose = require('mongoose'); 					// mongoose for mongodb
var database = require('./app/config/database'); 			// load the database config
var db = mongoose.connect(database.url);	// connect to mongoDB database on modulus.io



//Static files for API docs
app.use(express.static('./docs'));


//Middle-tier configuration
var bodyParser     = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//route file
require('./app/routes/routes.js')(app);
require('./app/routes/queueListener.js');


//Start the awesomeness
app.listen( port, ipaddr, function() {
	console.log('Magic happens on port ', port, ipaddr);
});
