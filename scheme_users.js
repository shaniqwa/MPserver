var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    userId: {type: Number, index: true },
    username: String,
    firstName: String,
    lastName: String,
    password: String,
    ageGroup: Number,
    email: String,
    FB_AT: String,
    FB_RT: String,
    YT_AT: String,
    YT_RT: String,
    country: String,
    profileImage: String,
    mode: Number,
    registered: {type : Date, default : Date.now},
    businessPieId: Number,
    pleasurePieId: Number,
    typeOfUser: String
});

exports.usersSchema = usersSchema; 