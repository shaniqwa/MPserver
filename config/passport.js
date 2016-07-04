// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var refresh = require('passport-oauth2-refresh');

var mongoose = require('mongoose');
var configDB = require('./database.js');
mongoose.connect(configDB.url); // connect to our database

var async = require("async");
var request = require('request');
var math = require('mathjs');

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
    // GOOGLE ==================================================================
    // =========================================================================
    var strategy_g = new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        profileFields   : ['profile', 'email', 'https://www.googleapis.com/auth/youtube' , 'https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtubepartner'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)


    },
    function(req, token, refreshToken, profile, done) {
        profile.type = req.query.state;
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

        // check if the user is already logged in
        if (!req.user) {
            // try to find the user based on their google id or email
            var email = null;
             if(typeof profile.emails !== 'undefined'){
                email = profile.emails[0].value; 
            }    
            User.findOne({ $or: [{ 'YT_id' : profile.id },{ 'email': email } ]}, function(err, user) {
                if (err)
                    return done(err);

                if(user){
                    if (user.YT_id) {
                        // if a user is found by google id, log them in
                        
                        console.log("update google tokens: ");
                        console.log(token);
                        console.log(refreshToken);
                        user.YT_AT = token;
                        user.YT_RT = refreshToken;
                        user.save(function(err){
                            if(err){
                                console.log(err);
                            }else{
                                return done(null, user);        
                            }
                        });
                        
                    } else if(user.email){
                                //user found only by his email, which means he is registered with a defferent social account.
                                //return that user already exsist, and direct to connect accounts.
                                done(null, false, { message: 'user email exists' });
                            }
                }else{
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
                if(refreshToken){
                    user.YT_RT = refreshToken;    
                }
                user.YT_email = profile.emails[0].value; 

                // save the user
                user.save(function(err) {
                    if (err)
                        throw err;
                    if(user.is_New == 1){
                            return done(null, user);
                    }else{
                        if(user.FB_AT != null && (!req.query.state)){
                            console.log("call update pie on user " + user.userId );
                            UpdateMP(user, function(err,callback){
                                if(err){
                                    return console.log(err);
                                }
                                return done(null, user);    
                            }); 
                        }else{
                            return done(null, user); 
                        }
                    }
                });
                //done save user
            }
        });

    });

    passport.use("google", strategy_g);
    refresh.use(strategy_g);


    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id','picture.type(large)', 'emails', 'displayName', 'name','birthday','location'],
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        enableProof: true

    },

    // facebook will send back the token and profile
    function(req,token, refreshToken, profile, done) {
        profile.type = req.query.state;
        // asynchronous
        process.nextTick(function() {
        // check if the user is already logged in
        if (!req.user) {
            var email = null;
             if(typeof profile.emails !== 'undefined'){
                email = profile.emails[0].value; 
            }            
            // find the user in the database based on their facebook id or email
            User.findOne({ $or: [{ 'FB_id' : profile.id },{ 'email': email } ]}, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);
                if(user){
                    if (user.FB_id) {
                        // if the user is found by facebook id, then log them in
                        console.log("facebook tekens: ");
                        console.log(token);
                        console.log(refreshToken);

                        return done(null, user); // user found, return that user
                    } else if(user.email){
                        //user found only by his email, which means he is registered with a defferent social account.
                        //return that user already exsist, and direct to connect accounts.
                        done(null, false, { message: 'user email exists' });
                    }
                }else{
                    // if there is no user found with that facebook id or email, create them
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
                if(refreshToken){
                    user.FB_RT = refreshToken;    
                }
                

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
                    if(user.is_New == 1){
                            return done(null, user);
                    }else{
                        if(user.YT_AT != null && (!req.query.state)){
                            console.log("call update pie on user " + user.userId );
                            //TODO: check if both access tokens needs to be refreashed
                            UpdateMP(user, function(err,callback){
                                if(err){
                                    return console.log(err);
                                }
                                return done(null, user);    
                            }); 
                        }else{
                            return done(null, user); 
                        }
                    }
                });
                //done save user
            }
        });

    }));

};


//by google
registerNewUser = function(platform, profile, token , refreshToken , NewUserCallback){
    console.log("reg new user, refresh token : " + refreshToken);
    var newUser = new User();
    // var url;
    console.log(profile.type);
    //same for both platforms
    newUser.mode = 1;
    newUser.typeOfUser = profile.type;
    newUser.is_New = 1;
    newUser.activityToken = genStirng(); // edited by stas - hash wasn't valid.

    //google
    if(platform == "google"){

        // set all of the relevant information from google to our user
        console.log("registering new user with google platform");
        newUser.YT_id    = profile.id;
        newUser.YT_AT = token;
        newUser.YT_RT = refreshToken;
        newUser.YT_email = profile.emails[0].value; // pull the first email
        newUser.username = profile.emails[0].value; //when signing up with google, the username is the email
        newUser.email = profile.emails[0].value; 
        newUser.firstName = profile.name.givenName;
        newUser.lastName = profile.name.familyName;
        if(profile._json.picture !== 'undefined'){
            //if google defualt image - use our own defualt image
            if(profile._json.picture == "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg"){
                newUser.profileImage = "http://themusicprofile.com/images/defualt_avatar.png";
            }else{
                newUser.profileImage = profile._json.picture;        
            }
            
        }
        
    }else if(platform == "facebook"){
        // set all of the facebook information in our user model
        

        //location
        try{
            if(profile._json.location.name !== 'undefined'){
                var country = profile._json.location.name.split(', ')[1];
                newUser.country = country;    
            }
        }catch(e){
            console.log("PASSPORST", e);
        }
        
        //age group
        if(profile._json.birthday !== 'undefined'){
            //calculate user age from his birthday
            var birthday = profile._json.birthday.split("/");
            var birthdayDate =  new Date(birthday[2], (birthday[1] - 1), birthday[0]);
            var today = new Date();
            var age = today.getFullYear() - birthdayDate.getFullYear();
            var m = today.getMonth() - birthdayDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthdayDate.getDate())) 
            {
                age--;
            }

            //classify user age to correct age group
            age = parseInt(age);

                if (age <= 14)  {
                    newUser.ageGroup = 1;
                }
                if (age >= 15 && age <= 24)  {
                    newUser.ageGroup = 2;
                }
                if (age >= 25 && age <= 34) {
                    newUser.ageGroup = 3;
                }
                if (age >= 35 && age <= 44)  {
                    newUser.ageGroup = 4;
                }
                if (age >= 45 && age <= 54)  {
                    newUser.ageGroup = 5;
                }
                if (age >= 55)  {
                    newUser.ageGroup = 6;
                }
                // console.log("ageGroup: " + newUser.ageGroup);
            }
        

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
    }
    

    var userid;
    // var MP = {};
    // MP.business = {};
    // MP.pleasure = {};

    async.waterfall([
    //step1 : create user and get his id
    function(callback) {
        //create user
        newUser.save(function (err, doc) {
          if (err) {
            return console.error(err);
          }
            userid = doc.userId;
            // console.log("userid:" + userid);
            callback();
        });
    },  
     //step 2 : create user's favorites list and black list.
    function(callback) {

        async.parallel([
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
    console.log("updating user MP.....");
    //TODO: validate tokens , if exprired : use refresh token 
    request.get('http://52.35.9.144:8082/MP/'+ user.FB_AT +'/' + user.YT_AT, function (error, response, body) {
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
            body = JSON.stringify([obj]);

            var arrB = [];
            var arrP = [];

            for(i in obj){
                arrB.push(obj[i]);
                arrP.push(obj[i]);
            }

            async.parallel([
                function(callback) {
                    //findOndAndUpdate :  business pies
                    BusinessPie.findOne({ businessPieId: user.userId }, function (err, doc) {
                          if (err){
                            callback(err);
                          } 
                          //found pie
                          
                          //update pie: compare data found in initial MP with user's preferences
                          for(var i = arrB.length - 1; i >= 0; i--){
                                //check if category is in prefs
                                if (doc.preferences.indexOf(arrB[i].category) > -1) {
                                    //In the array! all good
                                } else {
                                    arrB.splice(i, 1);  
                                }
                            }

                            //calc new percentages for each genre
                            var Btotal = 0;
                            for(i in arrB){
                                Btotal+= arrB[i].artists.length;
                            }
                            // console.log("b total: " + Btotal);

                            var len = arrB.length;
                            for(var k = 0; k<len; k++){
                                arrB[k].percent = (arrB[k].artists.length / Btotal) * 100;
                                arrB[k].percent = math.round(arrB[k].percent, 2);
                            }//done calc

                            //update genres in pie
                            doc.genres = arrB; 
                            //save pie
                            doc.save(function (err, doc) {    
                               if (err) {
                                 res.status(200).json("error saving user business pie: " + err.message);
                                 return console.error(err);
                               }
                                callback();
                            });
                    });
                },  
                function(callback) {
                    PleasurePie.findOne({ pleasurePieId: user.userId }, function (err, doc) {
                          if (err){
                            callback(err);
                          } 

                        //update pie: compare data found in initial MP with user's preferences
                          for(var i = arrP.length - 1; i >= 0; i--){
                                //check if category is in prefs
                                if (doc.preferences.indexOf(arrP[i].category) > -1) {
                                } else {
                                    arrP.splice(i, 1);  
                                }
                            }

                            //calc new percentages for each genre
                            var Ptotal = 0;
                            for(i in arrP){
                                Ptotal+= arrP[i].artists.length;
                            }
                            // console.log("p total: " + Ptotal);

                            var len = arrP.length;
                            for(var k = 0; k<len; k++){
                                arrP[k].percent = (arrP[k].artists.length / Ptotal) * 100;
                                arrP[k].percent = math.round(arrP[k].percent, 2);
                            }//done calc
                            
                            //update genres in pie
                            doc.genres = arrP; 
                            //save pie
                          doc.save(function (err, doc) {    
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
        }else if(error){ //error with lastfm http request
                return console.error(error);
            }
    });
}

function genStirng()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

