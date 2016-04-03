var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blacklistSchema = new Schema({
    userId: { type: Number, index: true},
    songs: [
        {
        	_id:false,
            song: String,
            artist: String
        }
    ]
});

exports.blacklistSchema = blacklistSchema; 