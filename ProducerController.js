var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var db = mongoose.createConnection(configDB.url); // connect to our database

var autoIncrement = require('mongoose-auto-increment');
var async = require("async");
autoIncrement.initialize(db);



var producerSongsGeneralSchema = require("./schemas/scheme_producerSongsGeneral.js").producerSongsGeneralSchema; 
var ProducerSongsGeneral = mongoose.model('Producer_songs_general', producerSongsGeneralSchema, 'Producer_songs_general');

var producerSongsSchema = require("./schemas/scheme_producerSongs.js").producerSongsSchema; 
var ProducerSongs = mongoose.model('Producers_songs_list', producerSongsSchema, 'Produces_songs_list');



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

