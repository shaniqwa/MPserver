var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var artistPieSchema = new Schema({
	artistPieId: {type: Number,index: true },
    preferences: [{ type: String}],
    genres: [
        {
        	category : String,
            genreName: String,
            percent: Number,
        }
    ]
});

exports.artistPieSchema = artistPieSchema; 