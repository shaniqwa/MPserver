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


exports.findMatch = function(res, userID){
	var genres = [];
	PleasurePie.findOne({ pleasurePieId: userID }, function (err, pleasureUser) {
	  if (err){
	  	res.status(200).json("error finding pleasur pie for user: " + err.message);
	  } 
	  for(var i=0; i<pleasureUser.genres.length; i++){
	  	if(genres.indexOf(pleasureUser.genres[i].genreName) === -1){
	  		genres.push(pleasureUser.genres[i].genreName);
	  	}
	  	
	  }	
	  console.log("done pleasure");

	  BusinessPie.findOne({ businessPieId: userID }, function (err, buisnessUser) {
		  if (err){
		  	res.status(200).json("error finding buisness pie for user: " + err.message);
		  } 
		  for(var i=0; i<buisnessUser.genres.length; i++){
		  	if(genres.indexOf(buisnessUser.genres[i].genreName) === -1){
		  		genres.push(buisnessUser.genres[i].genreName);
		  	}
		  	
		  }
		  console.log("done business");

		  console.log("categories:");
		  console.log(categories);

			ArtistPie.find({}, function (err, artists) {
				
			  if (err){
			  	res.status(200).json("error finding artists: " + err.message);
			  } 
			  
		      artists.forEach(function(artist){
		      	console.log("artist");
		      	console.log(artist);
		      	var matchGeners = [];
		      	for(var i=0; i<artist.genres.length; i++){
		      		// console.log("categories[i] "+categories[i]);
		      		if(genres.indexOf(artist.genres[i].genreName) > -1){
		      			console.log("success ");
		      			console.log(artist.genres[i].genreName);
		      			matchGeners.push(artist.genres[i].genreName);
			  		}
		      	}
		      	if(matchGeners.length >= 3){
		      		for(var i=0; i< matchGeners.length; i++){
		      			BusinessPie.update({ businessPieId: userID, 'genres.genreName': matchGeners[i] }, {$addToSet: { 'genres.producers': artist.artistPieId }} ,{new: true}, function (err, doc) {
						  if (err){
						  	res.status(200).json("error adding producer to BusinessPie: " + err.message);
						  	return err;
						  } 
						  PleasurePie.update({ pleasurePieId: userID, 'genres.genreName': matchGeners[i] }, {$addToSet: { 'genres.producers': artist.artistPieId }} ,{new: true}, function (err, doc) {
							  if (err){
							  	res.status(200).json("error adding producer to PleasurePie: " + err.message);
							  	return err;
							  } 
							   res.status(200).json("New producer has been added to both pies successfully for user " + userID);
							});
						});
		      		}
					
		      	}

		      });
			});

				  
		});
	});


}

//search
exports.searchuser = function(res,data) {

	User.findOne({ username: data }, function (err, doc) {
	  if (err){
	  	res.status(200).json("error searching user: " + err.message);
	  } 
	  // done!
	  console.log("doc "+doc);
	  var result = {username: doc.username, type: doc.typeOfUser, profileImage: doc.profileImage, firstName: doc.firstName, lastName: doc.lastName};
	  console.log(result);
	  res.status(200).json(result);
	});
}

//recommandation
exports.recommandation = function(res, userID){
	var producers = [];
	PleasurePie.findOne({ pleasurePieId: userID }, function (err, data) {
	  if (err){
	  	res.status(200).json("error finding pleasur pie for user: " + err.message);
	  } 
	  for(var i=0; i<data.genres.length; i++){
	  	console.log(data.genres[i].producers);
	  	producers.push.apply(producers, data.genres[i].producers);
	  	//console.log(producers);
	  }	
	  console.log("done pleasure");

	  BusinessPie.findOne({ businessPieId: userID }, function (err, data) {
		  if (err){
		  	res.status(200).json("error finding buisness pie for user: " + err.message);
		  } 
		  for(var i=0; i<data.genres.length; i++){
		  	console.log(data.genres[i].producers);
		  	producers.push.apply(producers, data.genres[i].producers);
		  	//console.log(producers);
		  }
		  console.log("done business");

		  console.log("producers:");
			console.log(producers);
			var result = [];

			User.find({}, function (err, data) {
				
			  if (err){
			  	res.status(200).json("error finding producers type: " + err.message);
			  } 
			  
			  console.log("data");
		      //console.log(data);

		      data.forEach(function(user){
		      	console.log("user");
		      	console.log(user.username +" " + user.typeOfUser);

		      	for(var i=0; i<producers.length; i++){
		      		console.log("producers[i] "+producers[i]);
		      		if(producers[i] === user.username && user.typeOfUser === "Producer"){
		      			console.log("success "+user.username)
			  			result.push({username: user.username, profileImage: user.profileImage});
			  		}
		      	}
		      });
			  console.log(result);
			  // for(var i=0; i<producers.length; i++){
			  // 	console.log("producers[i] "+producers[i]);
			  // 	for(var j=0; j<data.length; j++){
			  // 		if(producers[i].username === data[j].username){
			  // 			result.push({username: data[j].username, profileImage: data[j].profileImage});
			  // 		}
			  // 	}
			  	
			  // }
			  res.status(200).json(result);
			});

				  
		});
	});

	
}
