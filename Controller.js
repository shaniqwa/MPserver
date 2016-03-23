var config = require('config.json')('./config.json'),
	url = config.mongodb.url;

//Mongoose
var mongoose = require('mongoose');
	mongoose.connect(url);
var db = mongoose.connection;



var usersSchema = require("./scheme_users.js").usersSchema; 
var Consumer = mongoose.model('User', usersSchema, 'Users');

// var usersSchema = require("./scheme_users.js").usersSchema; 
// var Producer = mongoose.model('User', usersSchema, 'Users');

exports.registerConsumer = function(data) {
	var user1 = new Consumer(data);
// console.log(user1.lastName); 


// SAVE
user1.save(function (err, doc) {
  if (err) return console.error(err);
  console.log(doc);
});

//FIND
// Consumer.find(function (err, users) {
//   if (err) return console.error(err);
//   console.log(users);
// });

	return user1;
}


//TODO: register as producer - regular regisntration like consumer, but then we need to access the producer's YouTube authorized playlist
//and insert add songs to scheme_producerSongs.js