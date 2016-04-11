var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var producerSongsSchema = new Schema({
	prodId : {type: Number, index: true},
    songs: [
        {
            songId: Number,
            name: String,
            albumName: String,
            duration: Number,
            year: Number,
            artwork: String,
            url: String
        }
    ]
});