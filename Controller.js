//Mongoose
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var db = mongoose.createConnection(configDB.url); // connect to our database

var autoIncrement = require('mongoose-auto-increment');
var async = require("async");
var request = require('request');
autoIncrement.initialize(db);
var math = require('mathjs');

//===============MODELS===============
var usersSchema = require("./schemas/scheme_users.js").usersSchema; 
var User = mongoose.model('User', usersSchema, 'Users');

usersSchema.plugin(autoIncrement.plugin, { model: 'Users', field: 'userId' });

var businessPieSchema = require("./schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');

var favoritesSchema = require("./schemas/scheme_favorites.js").favoritesSchema; 
var Favorites = mongoose.model('Favorites', favoritesSchema, 'Favorites');

var blacklistSchema = require("./schemas/scheme_blacklist.js").blacklistSchema; 
var BlackList = mongoose.model('Black_list', blacklistSchema, 'Black_list');

var BusinessGraphSchema = require("./schemas/scheme_BusinessGraph.js").BusinessGraphSchema; 
var BusinessGraph = mongoose.model('Business_graph', BusinessGraphSchema, 'Business_graph');

var PleasureGraphSchema = require("./schemas/scheme_PleasureGraph.js").PleasureGraphSchema; 
var PleasureGraph = mongoose.model('Pleasure_graph', PleasureGraphSchema, 'Pleasure_graph');


//===============FUNCTIONS===============


//HAS BEEN RELOCATED to passport.js!!!
// exports.registerConsumer = function(res,data) {
// 	var newUser = new User(data.userInfo);
// 	var userid;

// 	async.waterfall([
// 	//step1 : create user and get his id
//     function(callback) {
// 		//create user
// 		newUser.save(function (err, doc) {
// 		  if (err) {
// 		  	res.status(200).json("error creating user: " + err.message);
// 		  	return console.error(err);
// 		  }
// 		  	userid = doc.userId;
// 		  	console.log("userid:" + userid);
// 		  	console.log(data.BusinessPie.businessPieId);
// 		  	data.BusinessPie.businessPieId = userid;
// 			data.PleasurePie.pleasurePieId = userid;
// 			callback();
// 		});
//     },	

//     //step 2 : create user's business pie, pleasure pie, favorites list and black list.
//     function(callback) {

// 		async.parallel([
// 		    function(callback) {
// 		    	var business_pie = new BusinessPie(data.BusinessPie);
// 				//Save user's business pie
// 				business_pie.save(function (err, doc) {
// 				  if (err) {
// 				  	res.status(200).json("error saving user business pie: " + err.message);
// 				  	return console.error(err);
// 				  }
// 				  callback();
// 				});
// 		    },
// 		    function(callback) {
// 		    	var pleasure_pie = new PleasurePie(data.PleasurePie);
// 				//Save user's pleasure pie
// 				pleasure_pie.save(function (err, doc) {
// 				  if (err) {
// 				  	res.status(200).json("error saving user pleasure pie: " + err.message);
// 				  	return console.error(err);
// 				  }
// 				  callback();
// 				});
// 		    },
// 		   	function(callback) {
// 		    	var favorites = new Favorites({ userId : userid });
// 				//Save user's pleasure pie
// 				favorites.save(function (err, doc) {
// 				  if (err) {
// 				  	res.status(200).json("error saving favorites list: " + err.message);
// 				  	return console.error(err);
// 				  }
// 				  callback();
// 				});
// 		    },
// 		    function(callback) {
// 		    	var blacklist = new BlackList({ userId : userid });
// 				//Save user's pleasure pie
// 				blacklist.save(function (err, doc) {
// 				  if (err) {
// 				  	res.status(200).json("error saving user blacklist pie: " + err.message);
// 				  	return console.error(err);
// 				  }
// 				  callback();
// 				});
// 		    }
// 		],callback);
//     }
// 	], function(err) {
// 	    if (err) {
// 	        throw err; //Or pass it on to an outer callback, log it or whatever suits your needs
// 	    }
// 	    console.log('New user has been added successfully');
// 	    res.status(200).json("New user has been added successfully");
// 	});
// }


exports.addToFavorites = function(res,data) {
	//addToSet make sure there are no duplicates is songs array.
	Favorites.findOneAndUpdate({ userId: data.userId }, {$addToSet: { songs: data.songData }} ,{new: true}, function (err, doc) {
	  if (err){
	  	res.status(200).json("error adding song to favorites: " + err.message);
	  	return err;
	  } 
	  // done!
	  res.status(200).json("New song has been added to favorites successfully for user " + data.userId);
	});
}

exports.getFavorites = function(res,userId) {
	//addToSet make sure there are no duplicates is songs array.
	Favorites.findOne({ userId: userId }, function (err, doc) {
	  if (err){
	  	res.status(200).json("error getting favorites: " + err.message);
	  	return err;
	  } 
	  // done!
	  res.status(200).json(doc.songs);
	});
}
exports.addToBlackList = function(res,data) {
	//addToSet make sure there are no duplicates is songs array.
	BlackList.findOneAndUpdate({ userId: data.userId }, {$addToSet: { songs: data.songData }} ,{new: true}, function (err, doc) {
	  if (err){
	  	res.status(200).json("error adding song to blacklist: " + err.message);
	  	return err;
	  } 
	  // done!
	  res.status(200).json("New song has been added to blacklist successfully for user " + data.userId);
	});
}

//safe delete of a user - remove all his data from different collections
exports.deleteUser = function(res, userID){
	User.findOne({ userId: userID }).remove().exec();
	BusinessPie.findOne({ businessPieId: userID }).remove().exec();
	PleasurePie.findOne({ pleasurePieId: userID }).remove().exec();
	Favorites.findOne({ userId: userID }).remove().exec();
	BlackList.findOne({ userId: userID }).remove().exec();
	BusinessGraph.findOne({ pieId: userID }).remove().exec();
	PleasureGraph.findOne({ pieId: userID }).remove().exec();
	res.status(200).json("User has been deleted " + userID);
}

exports.processWizardForm = function(req,res,data) {
	// console.log(data);

	var MP = {};
    MP.business = {};
    MP.business.preferences = [];
    MP.business.genres = [];
    MP.pleasure = {};
    MP.pleasure.preferences = [];
    MP.pleasure.genres = [];

    var url;

	async.waterfall([
    //step1 : get user from db
    function(callback) {
        User.findOneAndUpdate({ 'userId' : data.userID },{is_New: 0} ,function(err, user) {
		    if (err)
		        console.log(err);

		    if (user) {
		        req.user = user;
		        if(req.user.FB_AT){
		        	url = "http://52.35.9.144:8082/MP/" + req.user.FB_AT + "/null";
		        }else if(req.user.YT_AT){
		        	url = "http://52.35.9.144:8082/MP/null/" + req.user.YT_AT;
		        }
		        callback();
		    } 
		});
    },
    //step 2: creat initial MP
    function(callback) {
       request.get(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log("success return from ws");
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
            MP.business.businessPieId = data.userID;
            MP.business.genres = obj;
            MP.pleasure.pleasurePieId = data.userID;
            MP.pleasure.genres = obj;
            // console.log(MP);
            callback();
          }else if(error){
            return console.error(error);
          }
        });
    },
    //step 3: save preferences recived in form and calculate new pies
     function(callback) {
     	// MP.business.preferences
		if(data.b_rock){
			MP.business.preferences.push(data.b_rock);
		}
		if(data.b_pop){
			MP.business.preferences.push(data.b_pop);
		}
		if(data.b_rnb){
			MP.business.preferences.push(data.b_rnb);
		}
		if(data.b_classical){
			MP.business.preferences.push(data.b_classical);
		}
		if(data.b_country){
			MP.business.preferences.push(data.b_country);
		}
		if(data.b_elctronic){
			MP.business.preferences.push(data.b_elctronic);
		}
		if(data.b_latin){
			MP.business.preferences.push(data.b_latin);
		}
		if(data.b_blues){
			MP.business.preferences.push(data.b_blues);
		}
		if(data.b_world){
			MP.business.preferences.push(data.b_world);
		}
		if(data.b_punk){
			MP.business.preferences.push(data.b_punk);
		}
		if(data.b_metal){
			MP.business.preferences.push(data.b_metal);
		}
		if(data.b_jazz){
			MP.business.preferences.push(data.b_jazz);
		}
		if(data.b_folk){
			MP.business.preferences.push(data.b_folk);
		}
		if(data.b_reggae){
			MP.business.preferences.push(data.b_reggae);
		}
		if(data.b_hiphop){
			MP.business.preferences.push(data.b_hiphop);
		}

		// MP.pleasure.preferences
		if(data.p_rock){
			MP.pleasure.preferences.push(data.p_rock);
		}
		if(data.p_pop){
			MP.pleasure.preferences.push(data.p_pop);
		}
		if(data.p_rnb){
			MP.pleasure.preferences.push(data.p_rnb);
		}
		if(data.p_classical){
			MP.pleasure.preferences.push(data.p_classical);
		}
		if(data.p_country){
			MP.pleasure.preferences.push(data.p_country);
		}
		if(data.p_elctronic){
			MP.pleasure.preferences.push(data.p_elctronic);
		}
		if(data.p_latin){
			MP.pleasure.preferences.push(data.p_latin);
		}
		if(data.p_blues){
			MP.pleasure.preferences.push(data.p_blues);
		}
		if(data.p_world){
			MP.pleasure.preferences.push(data.p_world);
		}
		if(data.p_punk){
			MP.pleasure.preferences.push(data.p_punk);
		}
		if(data.p_metal){
			MP.pleasure.preferences.push(data.p_metal);
		}
		if(data.p_jazz){
			MP.pleasure.preferences.push(data.p_jazz);
		}
		if(data.p_folk){
			MP.pleasure.preferences.push(data.p_folk);
		}
		if(data.p_reggae){
			MP.pleasure.preferences.push(data.p_reggae);
		}
		if(data.p_hiphop){
			MP.pleasure.preferences.push(data.p_hiphop);
		}

		// console.log("business pref: " + MP.business.preferences);
		// console.log("pleasure pref: " + MP.pleasure.preferences);
		
		var arrB = [];
		var arrP = [];

		for(i in MP.business.genres){
			arrB.push(MP.business.genres[i]);
			arrP.push(MP.business.genres[i]);
		}

 		for(var i = arrB.length - 1; i >= 0; i--){
			//check if category is in prefs
			if (MP.business.preferences.indexOf(arrB[i].category) > -1) {
			    //In the array! all good
			    // console.log("in business array: "+ arrB[i].category);
			} else {
			    //Not in the array, take this genre out of pie
			    // console.log("NOT in business array: "+ arrB[i].category);
			    arrB.splice(i, 1);	
			}
		}
		// console.log("BusinessPie");
		// console.log(arrB);

		for(var j = arrP.length - 1; j >= 0; j--){
				//check jf category js jn prefs
				if (MP.pleasure.preferences.indexOf(arrP[j].category) > -1) {
				    //jn the array! all good
				    // console.log("in pleasure array: "+ arrP[j].category);
				} else {
				    //Not jn the array, take thjs genre out of pje
				    // console.log("NOT in pleasure array: "+ arrP[j].category);
				    arrP.splice(j, 1);	
				}
		}

		//calc new percentages
		var Btotal = 0, Ptotal = 0;
		for(i in arrB){
			Btotal+= arrB[i].artists.length;
		}
		// console.log("b total: " + Btotal);

		for(i in arrP){
			Ptotal+= arrP[i].artists.length;
		}
		// console.log("p total: " + Ptotal);


		var len = arrB.length;
		for(var k = 0; k<len; k++){
			arrB[k].percent = (arrB[k].artists.length / Btotal) * 100;
			arrB[k].percent = math.round(arrB[k].percent, 2);
		}
		var len = arrP.length;
		for(var k = 0; k<len; k++){
			arrP[k].percent = (arrP[k].artists.length / Ptotal) * 100;
			arrP[k].percent = math.round(arrP[k].percent, 2);
		}

		MP.business.genres = arrB;
		MP.pleasure.genres = arrP;

		// console.log("BusinessPie");
		// console.log(arrB);
		// console.log("PleasurePie");
		// console.log(arrP);
        callback();
    },

    //step 4:  save new pies to db
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
            }

        ],callback);
    }
    ], function(err) {
        if (err) {
			console.log(err);  
        }
        console.log('New user has been added successfully');
		res.redirect('/profile'); 
    });

    







	
	//addToSet make sure there are no duplicates is songs array.
	// Favorites.findOneAndUpdate({ userId: data.userId }, {$addToSet: { songs: data.songData }} ,{new: true}, function (err, doc) {
	//   if (err){
	//   	res.status(200).json("error adding song to favorites: " + err.message);
	//   	return err;
	//   } 
	//   // done!
	//   res.status(200).json("New song has been added to favorites successfully for user " + data.userId);
	// });
}


//TODO: register as producer - regular regisntration like consumer, but then we need to access the producer's YouTube authorized playlist
//and insert add songs to scheme_producerSongs.js