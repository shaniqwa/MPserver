//Mongoose
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var db = mongoose.createConnection(configDB.url); // connect to our database

var autoIncrement = require('mongoose-auto-increment');
var async = require("async");
var request = require('request');
autoIncrement.initialize(db);
var math = require('mathjs');

//===============MODELS===============
var usersSchema = require("./schemas/scheme_users.js").usersSchema; 
var User = mongoose.model('User', usersSchema, 'Users');

usersSchema.plugin(autoIncrement.plugin, { model: 'Users', field: 'userId' });

var artistPieSchema = require("./schemas/scheme_artistPie.js").artistPieSchema; 
var ArtistPie = mongoose.model('Artist_pie', artistPieSchema, 'Artist_pie');

var businessPieSchema = require("./schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');

var favoritesSchema = require("./schemas/scheme_favorites.js").favoritesSchema; 
var Favorites = mongoose.model('Favorites', favoritesSchema, 'Favorites');

var blacklistSchema = require("./schemas/scheme_blacklist.js").blacklistSchema; 
var BlackList = mongoose.model('Black_list', blacklistSchema, 'Black_list');

var BusinessGraphSchema = require("./schemas/scheme_BusinessGraph.js").BusinessGraphSchema; 
var BusinessGraph = mongoose.model('Business_graph', BusinessGraphSchema, 'Business_graph');

var PleasureGraphSchema = require("./schemas/scheme_PleasureGraph.js").PleasureGraphSchema; 
var PleasureGraph = mongoose.model('Pleasure_graph', PleasureGraphSchema, 'Pleasure_graph');


exports.findMatch = function(res,userID){
	var matchGeners = [];
	console.log("insinde find findMatch");
	var genres = [];
	console.log(userID);
	PleasurePie.findOne({ pleasurePieId: userID }, function (err, pleasureUser) {
	  if (err || pleasureUser === null){
	  	// console.log(err);
	  	return err;
	  } 
	  console.log("find PleasurePie");
		  for(var i=0; i<pleasureUser.genres.length; i++){
		  	if(genres.indexOf(pleasureUser.genres[i].genreName) === -1){
		  		genres.push(pleasureUser.genres[i].genreName);
		  	}	
		  }	
		  console.log("done pleasure");
	});
	  

	BusinessPie.findOne({ businessPieId: userID }, function (err, buisnessUser) {
		  if (err || buisnessUser === null){
		  	return err;
		  	// res.status(200).json("error finding buisness pie for user: " + err.message);
		  } 
		  console.log("find BusinessPie");
			  for(var i=0; i<buisnessUser.genres.length; i++){
			  	if(genres.indexOf(buisnessUser.genres[i].genreName) === -1){
			  		genres.push(buisnessUser.genres[i].genreName);
			  	}
			  }
		console.log("done business");
	});	  

  	console.log("genres:");
  	// console.log(genres);

	ArtistPie.find({}, function (err, artists) {
		console.log("find artist");
	  if (err || artists === null){
	  	return err;
	  	// res.status(200).json("error finding artists: " + err.message);
	  } 
	  
	      artists.forEach(function(artist){
	      	console.log("artist");
	      	// console.log(artist);
	      	matchGeners = [];
		      	for(var i=0; i<artist.genres.length; i++){
		      		// console.log("categories[i] "+categories[i]);
		      		if(genres.indexOf(artist.genres[i].genreName) > -1){
		      			console.log("success ");
		      			console.log(artist.genres[i].genreName);
		      			matchGeners.push(artist.genres[i].genreName);
			  		}
		      	}
	      });
	 });


      	if(matchGeners.length >= 3){
      		for(var i=0; i< matchGeners.length; i++){
      			BusinessPie.update({ businessPieId: userID, 'genres.genreName': matchGeners[i] }, {$addToSet: { 'genres.$.producers': artist.artistPieId }} ,false, function (err, doc) {
				  if (err){
				  	// res.status(200).json("error adding producer to BusinessPie: " + err.message);
				  	return err;
				  } 
				});
				

				PleasurePie.update({ pleasurePieId: userID, 'genres.genreName': matchGeners[i] }, {$addToSet: { 'genres.$.producers': artist.artistPieId }} ,false, function (err, doc) {
					  if (err){
					  	// res.status(200).json("error adding producer to PleasurePie: " + err.message);
					  	return err;
					  } 
					   // res.status(200).json("New producer has been added to both pies successfully for user " + userID);
					   return null;
				});
				
      		}
			
      	}
      	res.status(200).json("finished match");
}

//search
exports.searchSpecificUser = function(res,data) {

	User.findOne({ username: data }, function (err, doc) {
	  if (err || doc === null){
	  	res.status(200).json("error searching user: " + err.message);
	  } 
	  // done!
	  console.log("doc "+doc);
	  var result = {username: doc.username, type: doc.typeOfUser, profileImage: doc.profileImage, firstName: doc.firstName, lastName: doc.lastName};
	  console.log(result);
	  res.status(200).json(result);
	});
}

//search
exports.searchuser = function(res,data) {

	User.find({ username: {$regex: data} }, function (err, doc) {
	  if (err || doc === null){
	  	res.status(200).json("error searching substring user: " + err.message);
	  } 
	  // done!
	  var result = [];
	  doc.forEach(function(user){
	  	result.push({username: user.username, type: user.typeOfUser, profileImage: user.profileImage, firstName: user.firstName, lastName: user.lastName});
	  });
	  //console.log(result);
	  res.status(200).json(result);
	});
}


//delete song from favorite
exports.removeFav = function(res, data){
	Favorites.update({ userId: data.userID }, { $pull: { 'songs': { song: data.songs.song } } });
	res.status(200).json("Songs has been deleted " + userID);
}

//recommandation
exports.recommandation = function(res, userID){
	var producers = [];
	PleasurePie.findOne({ pleasurePieId: userID }, function (err, data) {
	  if (err || data === null){
	  	res.status(200).json("error finding pleasur pie for user: " + err.message);
	  } 
	  //console.log(data);
	  for(var i=0; i<data.genres.length; i++){
	  	//console.log(data.genres[i].producers);
	  	producers.push.apply(producers, data.genres[i].producers);
	  	//console.log(producers);
	  }	
	  console.log("done pleasure");
 });
	  BusinessPie.findOne({ businessPieId: userID }, function (err, data) {
		  if (err || data === null){
		  	res.status(200).json("error finding buisness pie for user: " + err.message);
		  } 
		  for(var i=0; i<data.genres.length; i++){
		  	console.log(data.genres[i].producers);
		  	producers.push.apply(producers, data.genres[i].producers);
		  	//console.log(producers);
		  }
		 // console.log("done business");
});
// 		 // console.log("producers:");
// 			console.log(producers);
			var result = [];
			for(var i=0; i<producers.length; i++){
		      		console.log("producers[i] "+producers[i]);
		      		User.findOne({ userID: producers[i] }, function (err, data) {
			  			result.push({usernsame: user.username, profileImage: user.profileImage});
			  		});
		      	}

			// User.find({}, function (err, users) {
				
			//   if (err || users === null){
			//   	res.status(200).json("error finding producers type: " + err.message);
			//   } 
			  
			//   console.log("users");
		 //      //console.log(data);

		 //      users.forEach(function(user){
		 //      	console.log("user");
		 //      	console.log(user.username +" " + user.typeOfUser);

		 //      	for(var i=0; i<producers.length; i++){
		 //      		console.log("producers[i] "+producers[i]);
		 //      		if(producers[i] === user.username && user.typeOfUser === "Producer"){
		 //      			console.log("success "+user.username)
			//   			result.push({username: user.username, profileImage: user.profileImage});
			//   		}
		 //      	}
		  
			   console.log(result);
			  res.status(200).json(result);
}
exports.getFollowing = function(res,userId) {
	//addToSet make sure there are no duplicates is songs array.
	User.findOne({ userId: userId }, function (err, doc) {
	  if (err){
	  	res.status(200).json("error getting following: " + err.message);
	  	return err;
	  } 
	  // done!
	  res.status(200).json(doc.following);
	});
}

//add to followers
exports.addToFollow = function(res,Fuser,userF) {
var follower = {};

	async.waterfall([
		// step 1: find me
	    function(callback) {
	    	User.findOne({ userId: Fuser }, function (err, doc) {
				  if (err) {
				  	callback(err);
				  	return;
				  }
				  	
					follower.userId = doc.userId;
	  	 			follower.username = doc.username;
	  				follower.profileImg = doc.profileImage;
	  				follower.first = doc.firstName;
	  	            follower.last = doc.lastName;
	  	            console.log(follower);
	                callback();
			});

	    },	
	    //step 2 : add me as a follower
	    function(callback) {
	    		User.findOneAndUpdate({ userId: userF }, {$addToSet: { followers: follower }} ,{new: true}, function (err, doc) {
				  if (err) {
				  	callback(err);
				  	return;
				  }
				  
					follower.userId = doc.userId;
	  	 			follower.username = doc.username;
	  				follower.profileImg = doc.profileImage;
	  				follower.first = doc.firstName;
	  	            follower.last = doc.lastName;
	                callback();
			});

	    },
	    //step 3: add other user to my following
	    function(callback){
	    		User.findOneAndUpdate({ userId: Fuser }, {$addToSet: { following: follower }} ,{new: true}, function (err, doc) {
				  if (err) {
				  	callback(err);
				  	return;
				  }
	                callback();
			});

	    }
	], function(err) {
	    if (err) {
	        throw err; //Or pass it on to an outer callback, log it or whatever suits your needs
	    }
	    console.log("added to following");
	    res.status(200).json("added to following");
	});
}
