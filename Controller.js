var config = require('config.json')('./config.json'),
	url = config.mongodb.url;
var async = require("async");

//Mongoose
var mongoose = require('mongoose');
	mongoose.connect(url);
var db = mongoose.connection;

var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(db);


//set schemas to models. Models are used as classes
var usersSchema = require("./schemas/scheme_users.js").usersSchema; 
var Consumer = mongoose.model('User', usersSchema, 'Users');

usersSchema.plugin(autoIncrement.plugin, { model: 'Users', field: 'userId' });

var businessPieSchema = require("./schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');

exports.registerConsumer = function(res,data) {
	var newUser = new Consumer(data.userInfo);

	async.waterfall([
		//step1
    function(callback) {
    	var userid;
		//SAVE user
		newUser.save(function (err, doc) {
		  if (err) {
		  	res.status(200).json("error creating user: " + err.message);
		  	return console.error(err);
		  }
		  	userid = doc.userId;
		  	console.log("userid:" + userid);
		  	console.log(data.BusinessPie.businessPieId);
		  	data.BusinessPie.businessPieId = userid;
			data.PleasurePie.pleasurePieId = userid;
			callback();
		});
    },	

    //step 2
    function(callback) {
		var business_pie = new BusinessPie(data.BusinessPie);
		//Save user's business pie
		business_pie.save(function (err, doc) {
		  if (err) {
		  	res.status(200).json("error saving user business pie: " + err.message);
		  	return console.error(err);
		  }
		  callback();
		});
    },
   	//step 3
    function(callback) {
		var pleasure_pie = new PleasurePie(data.PleasurePie);
		//Save user's pleasure pie
		pleasure_pie.save(function (err, doc) {
		  if (err) {
		  	res.status(200).json("error saving user pleasure pie: " + err.message);
		  	return console.error(err);
		  }
		  callback();
		});
    }
	], function(err) {
	    if (err) {
	        throw err; //Or pass it on to an outer callback, log it or whatever suits your needs
	    }
	    console.log('New user has been added successfully');
	    res.status(200).json("New user has been added successfully");
	});
}


//TODO: register as producer - regular regisntration like consumer, but then we need to access the producer's YouTube authorized playlist
//and insert add songs to scheme_producerSongs.js