var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var db = mongoose.createConnection(configDB.url); // connect to our database

var autoIncrement = require('mongoose-auto-increment');
var async = require("async");
var request = require('request');
autoIncrement.initialize(db);



var producerSongsGeneralSchema = require("./schemas/scheme_producerSongsGeneral.js").producerSongsGeneralSchema; 
var ProducerSongsGeneral = mongoose.model('Producer_songs_general', producerSongsGeneralSchema, 'Producer_songs_general');

var producerSongsSchema = require("./schemas/scheme_producerSongs.js").producerSongsSchema; 
var ProducerSongs = mongoose.model('Producer_songs_list', producerSongsSchema, 'Producer_songs_list');

var usersSchema = require("./schemas/scheme_users.js").usersSchema; 
var User = mongoose.model('User', usersSchema, 'Users');

exports.getProducerSongs = function(res,prodId){
    //from general schema
	ProducerSongs.findOne({ prodId : prodId}, function (err, doc) {
	  if (err){
	  	res.status(200).json("error getProducerSongs: " + err.message);
	  	return err;
	  } 
	  // done!
	  res.status(200).json(doc);
	});
}

exports.getProducerStatistics = function(res,prodId){
	//from general schema
	ProducerSongsGeneral.findOne({ userId : prodId}, function (err, doc) {
	  if (err){
	  	res.status(200).json("error getProducerStatistics: " + err.message);
	  	return err;
	  } 
	  // done!
	  res.status(200).json(doc);
	});
} 

exports.updateCounters = function(res,prodId,songId,userId){
	//from general schema
	//TODO pass to this func also the user id. check what it the user's age group and country, and increment only the relevent counters.
	User.findOne({ userId : userId}, function (err, docuser) {
	  if (err){
	  	res.status(200).json("error getProducerStatistics: " + err.message);
	  	return err;
	  } 
	  			User.findOne({ userId : prodId}, function (err, docprod) {
				  if (err){
				  	res.status(200).json("error getProducerStatistics: " + err.message);
				  	return err;
				  } 
				  	if(docuser.country == docprod.country){
				  		  switch(docuser.ageGroup){
				  		  	 case 1:
                                    ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, counterLocal:1, ageGroup1Counter:1, 'songs.$.counterAgeGroup1':1, 'songs.$.counterTotal':1,'songs.$.counterLocal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 2:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, counterLocal:1, ageGroup2Counter:1, 'songs.$.counterAgeGroup2':1, 'songs.$.counterTotal':1,'songs.$.counterLocal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 3:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, counterLocal:1, ageGroup3Counter:1, 'songs.$.counterAgeGroup3':1, 'songs.$.counterTotal':1,'songs.$.counterLocal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 4:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, counterLocal:1, ageGroup4Counter:1, 'songs.$.counterAgeGroup4':1, 'songs.$.counterTotal':1,'songs.$.counterLocal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 5:
                                    ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, counterLocal:1, ageGroup5Counter:1, 'songs.$.counterAgeGroup5':1, 'songs.$.counterTotal':1,'songs.$.counterLocal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 6:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, counterLocal:1, ageGroup6Counter:1, 'songs.$.counterAgeGroup6':1, 'songs.$.counterTotal':1,'songs.$.counterLocal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  }
				  	}			
				  	else{
				  		switch(docuser.ageGroup){
				  		  	 case 1:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, internalCounter:1, ageGroup1Counter:1, 'songs.$.counterAgeGroup1':1, 'songs.$.counterTotal':1,'songs.$.counterInternal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 2:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, internalCounter:1, ageGroup2Counter:1, 'songs.$.counterAgeGroup2':1, 'songs.$.counterTotal':1,'songs.$.counterInternal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 3:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, internalCounter:1, ageGroup3Counter:1, 'songs.$.counterAgeGroup3':1, 'songs.$.counterTotal':1,'songs.$.counterInternal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 4:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, internalCounter:1, ageGroup4Counter:1, 'songs.$.counterAgeGroup4':1, 'songs.$.counterTotal':1,'songs.$.counterInternal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 5:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, internalCounter:1, ageGroup5Counter:1, 'songs.$.counterAgeGroup5':1, 'songs.$.counterTotal':1,'songs.$.counterInternal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  	 case 6:
                                     ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, internalCounter:1, ageGroup6Counter:1, 'songs.$.counterAgeGroup6':1, 'songs.$.counterTotal':1,'songs.$.counterInternal':1 } } ,{new: true}, function (err, doc) {
									  if (err){            
									  	res.status(200).json("error updateCounters: " + err.message);
									  	return err;
									  } 
									  // done!
									  res.status(200).json(doc);
									});
				  		  	 break;
				  		  }
				  	}
				});			
	});
} 

exports.getFacebookYoutubeStatistics = function(res,prodId){
	User.findOne({ userId : prodId}, function (err, docprod) {//TODO GET CHANNEL ID (id in url)
               var url = "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" + docprod.YT_channelId + "&key=AIzaSyCFLDEh1SbsSvQcgEVHuMOGfKefK8Ko-xc";
				request.get(url, function (error, response, body) {

					    if(error){
					         console.log("error in getFacebookYoutubeStatistics: " + error.message);
					         res.status(200).json(error.message);
					    }
						else if (!error && response.statusCode == 200) {
							
						    var obj = body.toString();
						    obj = JSON.parse(obj);
						    
						    res.status(200).json(obj);
					    }
				});
                   
    });
} 

