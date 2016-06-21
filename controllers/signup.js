var mongoose = require('mongoose');
var configDB = require('./../config/database.js');
// mongoose.connect(configDB.url); // connect to our database

var async = require("async");
var request = require('request');
var math = require('mathjs');
var Controller = require("./../Controller.js").usersSchema; 
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

exports.registerNewUserFromMobile = function(platform, type, profile, token , refreshToken , NewUserCallback){
    var newUser = new User();
    // var url;
   // console.log(profile.type);
    //same for both platforms
    newUser.mode = 1;
    newUser.typeOfUser = type;
    newUser.is_New = 1;
    newUser.activityToken = genStirng(); // edited by stas - hash wasn't valid.

    //google
    if(platform == "google"){

        // set all of the relevant information from google to our user
        console.log("registering new user with google platform");
        newUser.country = "Israel";
        newUser.YT_id    = profile.id;
        newUser.YT_AT = token;
        newUser.YT_RT = refreshToken;
        newUser.YT_email = profile.email; // pull the first email
        newUser.username = profile.email; //when signing up with google, the username is the email
        newUser.email = profile.email; 
        newUser.firstName = profile.name.split(" ")[0];
        newUser.lastName = profile.name.split(" ")[1];
        if(profile.photo !== 'undefined'){
            newUser.profileImage = profile.photo;    
        }
        
    }else if(platform == "facebook"){
        // set all of the facebook information in our user model
        

        //location
        if(profile.location.name !== 'undefined'){
            var country = profile.location.name.split(', ')[1];
            newUser.country = country;    
        }
        
        //age group
        if(profile.birthday !== 'undefined'){
            //calculate user age from his birthday
            var birthday = profile.birthday.split("/");
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
        if(typeof profile.email !== 'undefined'){
            newUser.FB_email = profile.email; // facebook can return multiple emails so we'll take the first
            newUser.username = profile.email; 
            newUser.email = profile.email; 
        }
        newUser.firstName = profile.first_name;
        newUser.lastName = profile.last_name;
        newUser.profileImage = profile.picture.data.url; 
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
            newUser = doc;
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


function genStirng(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}