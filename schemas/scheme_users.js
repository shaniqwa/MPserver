var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    userId: { type: Number, index: true },
    username:  { type: String, unique: true },
    // username:  String,
    firstName: String,
    lastName: String,
    password: String,
    ageGroup: Number,
    email:  { type: String, unique: true },
    // email:  String,
    FB_AT: String,
    FB_RT: String,
    FB_email: String, //new
    FB_id : String,    //new
    YT_AT: String,
    YT_RT: String,
    YT_email: String, //new
    YT_id : String,    //new
    country: String,
    profileImage: String,
    mode: Number,
    registered: {type : Date, default : Date.now},
    typeOfUser: String
});

// methods ======================
// generating a hash
usersSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
usersSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

exports.usersSchema = usersSchema; 