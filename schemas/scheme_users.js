var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    userId: { type: Number, index: true },
    username:  String,
    firstName: String,
    lastName: String,
    ageGroup: Number,
    email:  { type: String, unique: true },
    activityToken: String,
    FB_AT: String,
    FB_RT: String,
    FB_email: String, 
    FB_id : String,    
    YT_AT: String,
    YT_RT: String,
    YT_email: String, 
    YT_id : String,   
    country: String,
    profileImage: String,
    mode: Number,
    registered: {type : Date, default : Date.now},
    typeOfUser: String,
    is_New: Number,
    following: [
        {
            userId: {type: Number, index: true},
            username: String,
            profileImg: String,
            first: String,
            last: String
        }
    ],
    followers: [
    {
        userId: {type: Number, index: true},
        username: String,
        profileImg: String,
        first: String,
        last: String
    }
]
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