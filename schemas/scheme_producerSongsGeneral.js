var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var producerSongsGeneralSchema = new Schema({
    userId: {type: Number, index: true },
    songs: [
        {
            songId: Number,
            counterTotal: Number,
            counterInternal: Number,
            counterAgeGroup1: Number,    //14 and less
            counterAgeGroup2: Number,    //15-24
            counterAgeGroup3: Number,    //25-34
            counterAgeGroup4: Number,    //35-44
            counterAgeGroup5: Number,    //45-54
            counterAgeGroup6: Number,    //55+
            counterLocal: Number
        }
    ],
    ListeningNow: [
        {
            userId: Number,
            songId: Number
        }
    ],
    totalCounter: Number,  //
    internalCounter: Number,
    ageGroup1Counter: Number,  //14 and less
    ageGroup2Counter: Number,  //15-24
    ageGroup3Counter: Number,  //25-34
    ageGroup4Counter: Number,  //35-44
    ageGroup5Counter: Number,  //45-54
    ageGroup6Counter: Number,  //55+
    counterLocal: Number,  //number of listens in our system in the current country
    FBHISTORY: {
        history: String
    },
    YTHISTORY: {
        history: String
    }
});

exports.producerSongsGeneralSchema = producerSongsGeneralSchema; 