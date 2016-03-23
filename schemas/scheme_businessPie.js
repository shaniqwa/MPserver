var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var businessPieSchema = new Schema({
	    businessPieId: {type: Number,index: true },
    genres: [
        {
            genreName: String,
            percent: Number,
            artists: [
                {
                    artistName: String
                }
            ],
            producers: [
                {
                    producerName: String
                }
            ]
        }
    ]
});