// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://52.35.9.144:27017/musicprofile", function(err, db) {
  if(!err) {
    console.log("We are connected");
    
  }
});


	var db = {
    get: function () {
        return this;
    }, 
    update: function(data) { 
        this.returnData = data; 
        return this;
    }, 
    run: function(callback) {
        callback(null, this.returnData || {})
    }
};

module.exports = db;



var MongoClient = require('mongodb').MongoClient, 
	format = require('util').format;

var url = 'mongodb://52.35.9.144:27017/musicprofile';


MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server.");
          var collection = db.collection('GenresAndRelated');
                collection.findOne({"start": 1}, 
                function(err, document) {
                  if (err) { // didn't find pie data
                     throw err;
                  } 
                  else { 
                     this.related = document;