var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PleasureGraphSchema = new Schema({
    pieId:  { type: Number, index: true},
    nodes: [
        {
            name: String,
            percent: Number,
            visited: Number,
            counter: Number
        }
    ],
    edges: [
        {
            name: String,
            from: String,
            to: String
        }
    ]

});

exports.PleasureGraphSchema = PleasureGraphSchema; 