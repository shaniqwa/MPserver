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
var User = mongoose.model('User', usersSchema, 'Users');

usersSchema.plugin(autoIncrement.plugin, { model: 'Users', field: 'userId' });

var businessPieSchema = require("./schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');

var favoritesSchema = require("./schemas/scheme_favorites.js").favoritesSchema; 
var Favorites = mongoose.model('Favorites', favoritesSchema, 'Favorites');

var blacklistSchema = require("./schemas/scheme_blacklist.js").blacklistSchema; 
var BlackList = mongoose.model('Black_list', blacklistSchema, 'Black_list');

exports.registerConsumer = function(res,data) {
	var newUser = new User(data.userInfo);
	var userid;
	async.waterfall([
	//step1 : create user
    function(callback) {
		//create user
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

    //step 2 : create user's business pie, pleasure pie, favorites list and black list.
    function(callback) {

		async.parallel([
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
		    },
		   	function(callback) {
		    	var favorites = new Favorites({ userId : userid });
				//Save user's pleasure pie
				favorites.save(function (err, doc) {
				  if (err) {
				  	res.status(200).json("error saving favorites list: " + err.message);
				  	return console.error(err);
				  }
				  callback();
				});
		    },
		    function(callback) {
		    	var blacklist = new BlackList({ userId : userid });
				//Save user's pleasure pie
				blacklist.save(function (err, doc) {
				  if (err) {
				  	res.status(200).json("error saving user blacklist pie: " + err.message);
				  	return console.error(err);
				  }
				  callback();
				});
		    }
		],callback);
    }
	], function(err) {
	    if (err) {
	        throw err; //Or pass it on to an outer callback, log it or whatever suits your needs
	    }
	    console.log('New user has been added successfully');
	    res.status(200).json("New user has been added successfully");
	});
}

exports.addToFavorites = function(res,data) {
	// var userid;
	// async.waterfall([
	// 	//step1
 //    function(callback) {
	// User.findOne({ username: data.username }, function (err, doc) {
	// 	  if (err){
	// 	  	res.status(200).json("error finding user: " + err.message);
	// 	  	return err;
	// 	  } 
	// 	  // found!
	// 	  userid = doc.userId;
	// 	  console.log("User found: " + doc.userId);
	// 	  callback();
	// 	});
 //    },	

 //    //step 2
 //    function(callback) {


 //    }
	// ], function(err) {
	//     if (err) {
	//         throw err; //Or pass it on to an outer callback, log it or whatever suits your needs
	//     }
	//     console.log('New user has been added successfully');
	//     res.status(200).json("New user has been added successfully");
	// });
}


//TODO: register as producer - regular regisntration like consumer, but then we need to access the producer's YouTube authorized playlist
//and insert add songs to scheme_producerSongs.js