var mongoose = require('mongoose'),
	schema = mongoose.Schema;

var genresSchema = new schema({
	category: String,
	name: String,
	related_to:  [{ type: String}]
}, {collection: 'genres'});

exports.genresSchema = genresSchema; 
