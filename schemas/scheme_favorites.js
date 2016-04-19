var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoritesSchema = new Schema({
    userId: { type: Number, index: true},
    songs: [
        {
        	_id:false,
            song: String,
            artist: String,
            duration: String,
            url: String
        }
    ]
});

exports.favoritesSchema = favoritesSchema; 