var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    userId: {type: Number, index: true , ref: 'UserID'},
    username: { type: String, index: { unique: true } },
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
    typeOfUser: String
});

exports.usersSchema = usersSchema; 