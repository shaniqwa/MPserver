// Retrieve
var MongoClient = require('mongodb').MongoClient;

var schemas = require("./scheme_users.js").usersSchema; 
var _ = require("lodash");

//Consumer Class 
function Consumer(data) {
	this.data = this.sanitize(data);
}

Consumer.prototype.data = {}

Consumer.prototype.changeName = function (firstName) {
    this.data.firstName = firstName;
}

Consumer.prototype.get = function (name) {
    return this.data[name];
}

Consumer.prototype.set = function (name, value) {
    this.data[name] = value;
}


// sanitize uses a couple of lodash functions to only keep variables that are in the user schema. 
// _.defaults merges all variables from schemas.user into data that don't exist already. 
// _.keys gets all the keys from the schema. _.pick only keeps the variables who's names were returned by _.keys. 
// Basically it ensures this.data matches our schema exactly.
Consumer.prototype.sanitize = function (data) {  
    data = data || {};
    schema = schemas.tree;
    return _.pick(_.defaults(data, schema), _.keys(schema));
    return data; 
}

Consumer.prototype.save = function (callback) {  
    var self = this;
    this.data = this.sanitize(this.data);
    db.get('users', {id: this.data.id}).update(JSON.stringify(this.data)).run(function (err, result) {
        if (err) return callback(err);
        callback(null, self); 
    });
}

Consumer.findById = function (id, callback) {
    db.get('users', {id: id}).run(function (err, data) {
        if (err) return callback(err);
        callback(null, new User(data));
    });
}

module.exports = function(data){
	var consumer = new Consumer(data);
	return consumer;
}




		    

