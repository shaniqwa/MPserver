var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blacklistSchema = new Schema({
        userId: { type: Number, index: true},
    songs: [
        {
            song: String,
            artist: String
        }
    ]
});

exports.blacklistSchema = blacklistSchema; 