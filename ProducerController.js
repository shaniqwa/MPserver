var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var db = mongoose.createConnection(configDB.url); // connect to our database

var autoIncrement = require('mongoose-auto-increment');
var async = require("async");
autoIncrement.initialize(db);



var producerSongsGeneralSchema = require("./schemas/scheme_producerSongsGeneral.js").producerSongsGeneralSchema; 
var ProducerSongsGeneral = mongoose.model('Producer_songs_general', producerSongsGeneralSchema, 'Producer_songs_general');

var producerSongsSchema = require("./schemas/scheme_producerSongs.js").producerSongsSchema; 
var ProducerSongs = mongoose.model('Producer_songs_list', producerSongsSchema, 'Producer_songs_list');



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

exports.updateCounters = function(res,prodId,songId){
	//from general schema
	ProducerSongsGeneral.findOneAndUpdate({ userId: prodId, 'songs.songId':songId}, {$inc: { totalCounter:1, internalCounter:1, ageGroup1Counter:1 , ageGroup2Counter:1 , ageGroup3Counter:1 , ageGroup4Counter:1 , ageGroup5Counter:1 ,  ageGroup6Counter:1 ,counterLocal:1, 'songs.$.counterAgeGroup1':1, 'songs.$.counterAgeGroup2':1, 'songs.$.counterAgeGroup3':1, 'songs.$.counterAgeGroup4':1, 'songs.$.counterAgeGroup5':1, 'songs.$.counterAgeGroup6':1, 'songs.$.counterTotal':1, 'songs.$.counterInternal':1, 'songs.$.counterLocal':1 } } ,{new: true}, function (err, doc) {
	  if (err){            
	  	res.status(200).json("error updateCounters: " + err.message);
	  	return err;
	  } 
	  // done!
	  res.status(200).json(doc);
	});
} 

