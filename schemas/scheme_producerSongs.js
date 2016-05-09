var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var producerSongsSchema = new Schema({
	prodId : {type: Number, index: true},
    songs: [
        {
            _id:false,
            songId: Number,
            title: String,
            videoId: String
        }
    ]
});


exports.producerSongsSchema = producerSongsSchema; 