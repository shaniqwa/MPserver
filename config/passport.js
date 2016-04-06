// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var mongoose = require('mongoose');
var configDB = require('./database.js');
mongoose.connect(configDB.url); // connect to our database

var async = require("async");
var request = require('request');

//SCHEMAS
// load up the user model
var usersSchema = require("./../schemas/scheme_users.js").usersSchema; 
var User = mongoose.model('User', usersSchema, 'Users');

var businessPieSchema = require("./../schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./../schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');

var favoritesSchema = require("./../schemas/scheme_favorites.js").favoritesSchema; 
var Favorites = mongoose.model('Favorites', favoritesSchema, 'Favorites');

var blacklistSchema = require("./../schemas/scheme_blacklist.js").blacklistSchema; 
var BlackList = mongoose.model('Black_list', blacklistSchema, 'Black_list');

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.email    = email;
                newUser.password = newUser.generateHash(password);
                newUser.username = req.body.username;
                newUser.firstName = req.body.firstName;
                newUser.lastName = req.body.lastName;
                newUser.ageGroup = req.body.ageGroup;
                newUser.country = req.body.country;


                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));

     // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));


    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        profileFields   : ['profile', 'email', 'https://www.googleapis.com/auth/youtube' , 'https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtubepartner'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)


    },
    function(req, token, refreshToken, profile, done) {
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

        // check if the user is already logged in
        if (!req.user) {
            // try to find the user based on their google id
            User.findOne({ 'YT_id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    registerNewUser("google",profile, token, refreshToken, function(err,newUser){
                        return done(null, newUser);
                    });
                }
            });
            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user; // pull the user out of the session

                // update the current users google credentials
                user.YT_id    = profile.id;
                user.YT_AT = token;
                user.YT_RT = refreshToken;
                user.YT_email = profile.emails[0].value; 

                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;
                    if(user.FB_AT != null){
                        UpdateMP(user, function(err,callback){
                            if(err){
                                return console.log(err);
                            }
                            return done(null, user);    
                        });                        
                    }
                });
            }
        });

    }));


    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id','picture.type(large)', 'emails', 'displayName', 'name'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },

    // facebook will send back the token and profile
    function(req,token, refreshToken, profile, done) {
        console.log(profile);
        // asynchronous
        process.nextTick(function() {
        // check if the user is already logged in
        if (!req.user) {

            // find the user in the database based on their facebook id
            User.findOne({ 'FB_id' : profile.id }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    registerNewUser("facebook",profile, token, refreshToken, function(err,newUser){
                        return done(null, newUser);
                    });
                }

            });
             } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user; // pull the user out of the session

                // add current users facebook credentials
                user.FB_id    = profile.id;
                user.FB_AT = token;
                console.log("fb token: " + token);
                user.FB_RT = refreshToken;
                 if(typeof profile.emails !== 'undefined'){
                    user.FB_email = profile.emails[0].value; 
                }
                if(!user.profileImage){
                    user.profileImage = profile.photos[0].value; 
                    //get a larger photo from facebook : https://graph.facebook.com/<facebook-id>/picture?width=200&height=200&access_token=<facebook-token>
                }


                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;

                        UpdateMP(user, function(err,callback){
                            if(err){
                                return console.log(err);
                            }
                            return done(null, user);    
                        });                        

                });
            }
        });

    }));

};


//by google
registerNewUser = function(platform, profile, token , refreshToken , NewUserCallback){
    var newUser = new User();
    var url;
    if(platform == "google"){
        url = "http://localhost:8080/MP/null/" + token;
        // set all of the relevant information
        newUser.YT_id    = profile.id;
        newUser.YT_AT = token;
        newUser.YT_RT = refreshToken;
        newUser.YT_email = profile.emails[0].value; // pull the first email
        newUser.username = profile.emails[0].value; //when signing up with google, the username is the email
        newUser.email = profile.emails[0].value; 
        newUser.firstName = profile.name.givenName;
        newUser.lastName = profile.name.familyName;
        newUser.profileImage = profile._json.picture;
        newUser.typeOfUser = "Consumer";
        newUser.mode = 1;
    // newUser.country = profile._json.picture;    
    }else if(platform == "facebook"){
        url = "http://localhost:8080/MP/" + token + "/null";
        // set all of the facebook information in our user model
        newUser.FB_id    = profile.id; // set the users facebook id                   
        newUser.FB_AT = token; // we will save the token that facebook provides to the user   
        newUser.FB_RT = refreshToken;
        if(typeof profile.emails !== 'undefined'){
            newUser.FB_email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
            newUser.username = profile.emails[0].value; 
            newUser.email = profile.emails[0].value; 
        }
        newUser.firstName = profile.name.givenName;
        newUser.lastName = profile.name.familyName;
        newUser.profileImage = profile.photos[0].value; 
        newUser.typeOfUser = "Consumer";
        newUser.mode = 1;
    }
    

    var userid;
    var MP = {};
    MP.business = {};
    MP.pleasure = {};

    async.waterfall([
    //step1 : create user and get his id
    function(callback) {
        //create user
        newUser.save(function (err, doc) {
          if (err) {
            return console.error(err);
          }
            userid = doc.userId;
            console.log("userid:" + userid);
            callback();
        });
    },  
    //step 2 : build MP
    function(callback) {

        request.get(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //fix result to match our pie schema
            var obj = body.toString();
                obj = JSON.parse(obj);
            for(i in obj){
                obj[i].genreName = obj[i].genre;
                delete obj[i].genre;
                delete obj[i].counter;
                obj[i].producers = [];
            }
            // console.log(body); // Show the HTML for the Google homepage. 
            body = JSON.stringify([obj]);
            MP.business.businessPieId = userid;
            MP.business.genres = obj;
            MP.pleasure.pleasurePieId = userid;
            MP.pleasure.genres = obj;
            console.log(MP);
            callback();
          }else if(error){
            return console.error(error);
          }
        });
    },
     //step 3 : create user's business pie, pleasure pie, favorites list and black list.
    function(callback) {

        async.parallel([
            function(callback) {
                var business_pie = new BusinessPie(MP.business);
                //Save user's business pie
                business_pie.save(function (err, doc) {
                  if (err) {
                    res.status(200).json("error saving user business pie: " + err.message);
                    return console.error(err);
                  }
                  callback();
                });
            },
            function(callback) {
                var pleasure_pie = new PleasurePie(MP.pleasure);
                //Save user's pleasure pie
                pleasure_pie.save(function (err, doc) {
                  if (err) {
                    res.status(200).json("error saving user pleasure pie: " + err.message);
                    return console.error(err);
                  }
                  callback();
                });
            },
            function(callback) {
                var favorites = new Favorites({ userId : userid });
                //create ampty favorites 
                favorites.save(function (err, doc) {
                  if (err) {
                    res.status(200).json("error saving favorites list: " + err.message);
                    return console.error(err);
                  }
                  callback();
                });
            },
            function(callback) {
                var blacklist = new BlackList({ userId : userid });
                //create ampty blacklist 
                blacklist.save(function (err, doc) {
                  if (err) {
                    res.status(200).json("error saving user blacklist pie: " + err.message);
                    return console.error(err);
                  }
                  callback();
                });
            }
        ],callback);
    }
   
    ], function(err) {
        if (err) {
            NewUserCallback(err,null);    
        }
        console.log('New user has been added successfully');
        NewUserCallback(null,newUser);    
    });

}//end of function 

UpdateMP = function(user,UpdateMPcallback){
    request.get('http://localhost:8080/MP/'+ user.FB_AT +'/' + user.YT_AT, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //fix result to match our pie schema
            var obj = body.toString();
                obj = JSON.parse(obj);
            for(i in obj){
                obj[i].genreName = obj[i].genre;
                delete obj[i].genre;
                delete obj[i].counter;
                obj[i].producers = [];
            }
            // console.log(body); // Show the HTML for the Google homepage. 
            body = JSON.stringify([obj]);

            async.parallel([
                function(callback) {
                    //findOndAndUpdate :  business pies
                    BusinessPie.findOne({ businessPieId: user.userId }, function (err, doc) {
                          if (err){
                            callback(err);
                          } 
                          //found pie
                          doc.genres = obj; //update pie
                          doc.save(function (err, doc) {    //save pie
                           if (err) {
                             res.status(200).json("error saving user business pie: " + err.message);
                             return console.error(err);
                           }
                           callback();
                        });
                    });
                },  
                function(callback) {
                    //findOndAndUpdate :  pleasure pies
                    PleasurePie.findOne({ pleasurePieId: user.userId }, function (err, doc) {
                          if (err){
                            callback(err);
                          } 
                          //found pie
                          doc.genres = obj; //update pie
                          doc.save(function (err, doc) {    //save pie
                           if (err) {
                             res.status(200).json("error saving user pleasure pie: " + err.message);
                             return console.error(err);
                           }
                           callback();
                        });
                    });
                }
            ], function(err) {
                if (err) {
                    throw err; //Or pass it on to an outer callback, log it or whatever suits your needs
                }
                console.log('Both pies are saved now');
                UpdateMPcallback();
            });
        }else if(error){ //error with lastfm request
                return console.error(error);
            }
    });
}



