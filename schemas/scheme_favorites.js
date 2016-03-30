var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoritesSchema = new Schema({
    userId: { type: Number, index: true},
    songs: [
        {
            song: String,
            artist: String,
            duration: String
        }
    ]
});

exports.favoritesSchema = favoritesSchema; 