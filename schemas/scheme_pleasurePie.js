var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pleasurePieSchema = new Schema({
	    pleasurePieId: {type: Number,index: true },
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