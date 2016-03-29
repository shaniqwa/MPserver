var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    userId: { type: Number, index: true },
    username:  { type: String, unique: true },
    firstName: String,
    lastName: String,
    password: String,
    ageGroup: Number,
    email:  { type: String, unique: true },
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