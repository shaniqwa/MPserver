var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var businessPieSchema = new Schema({
	    businessPieId: {type: Number,index: true },
    genres: [
        {
            genreName: String,
            percent: Number,
            artists: [{ type: String}],
            producers: [{ type: String}]
        }
    ]
});

exports.businessPieSchema = businessPieSchema; 