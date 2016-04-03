var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pleasurePieSchema = new Schema({
	pleasurePieId: {type: Number,index: true },
    genres: [
        {
        	category: String,
            genreName: String,
            percent: Number,
            artists: [{ type: String}],
            producers: [{ type: String}]
        }
    ]
});

exports.pleasurePieSchema = pleasurePieSchema; 