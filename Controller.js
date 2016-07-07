//Mongoose
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var db = mongoose.createConnection(configDB.url); // connect to our database

var autoIncrement = require('mongoose-auto-increment');
var async = require("async");
var request = require('request');
autoIncrement.initialize(db);
var math = require('mathjs');
var ControllerB = require('./ControllerB');
var refresh = require('passport-oauth2-refresh');

//===============MODELS===============
var usersSchema = require("./schemas/scheme_users.js").usersSchema; 
var User = mongoose.model('User', usersSchema, 'Users');

usersSchema.plugin(autoIncrement.plugin, { model: 'Users', field: 'userId' });

var businessPieSchema = require("./schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');

var BusinessGraphSchema = require("./schemas/scheme_BusinessGraph.js").BusinessGraphSchema; 
var BusinessGraph = mongoose.model('Business_graph', BusinessGraphSchema, 'Business_graph');

var PleasureGraphSchema = require("./schemas/scheme_PleasureGraph.js").PleasureGraphSchema; 
var PleasureGraph = mongoose.model('Pleasure_graph', PleasureGraphSchema, 'Pleasure_graph');

var artistPieSchema = require("./schemas/scheme_artistPie.js").artistPieSchema; 
var ArtistPie = mongoose.model('Artist_pie', artistPieSchema, 'Artist_pie');

var favoritesSchema = require("./schemas/scheme_favorites.js").favoritesSchema; 
var Favorites = mongoose.model('Favorites', favoritesSchema, 'Favorites');

var blacklistSchema = require("./schemas/scheme_blacklist.js").blacklistSchema; 
var BlackList = mongoose.model('Black_list', blacklistSchema, 'Black_list');

var BusinessGraphSchema = require("./schemas/scheme_BusinessGraph.js").BusinessGraphSchema; 
var BusinessGraph = mongoose.model('Business_graph', BusinessGraphSchema, 'Business_graph');

var PleasureGraphSchema = require("./schemas/scheme_PleasureGraph.js").PleasureGraphSchema; 
var PleasureGraph = mongoose.model('Pleasure_graph', PleasureGraphSchema, 'Pleasure_graph');

var producerSongsSchema = require("./schemas/scheme_producerSongs.js").producerSongsSchema; 
var ProducerSongs = mongoose.model('Producer_songs_list', producerSongsSchema, 'Producer_songs_list');

producerSongsSchema.plugin(autoIncrement.plugin, { model: 'Producer_songs_list', field: 'songs.songId' });


var producerSongsGeneralSchema = require("./schemas/scheme_producerSongsGeneral.js").producerSongsGeneralSchema; 
var ProducerSongsGeneral = mongoose.model('Producer_songs_general', producerSongsGeneralSchema, 'Producer_songs_general');


var genresSchema = require("./schemas/scheme_genres.js").genresSchema;
var AllGenres = mongoose.model('genres', genresSchema);

//===============FUNCTIONS===============


// Add a sond to favorites. song detains are sent via post and recived in data
var addToFavorites = function(res,data) {
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


//get users favoties songs list
var getFavorites = function(res,userId) {
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




// remove song from users favorites list
var removeFav = function(res,userId,song,artist) {
	
	Favorites.update({userId: userId}, {$pull:{songs:{song:song,artist:artist} } }).exec(function(err) {
	    res.status(200).json("New song has been removed from favorites successfully, songId: " + song + " " + artist);
    });
}



// add song to users blacklist
var addToBlackList = function(res,data) {
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



//Delete User
//safe delete of a user - remove all his data from different collections
var deleteUser = function(res, userID){
	
	//remove user from all following users, by cheking the deleted user followers 
	var q = async.queue(function (task, taskCallback) {
    console.log('remove ' + task.user.userId + ' from ' + task.userId + ' ' + task.array);
    var arrayToPull = task.array;
	if(task.array == 'followers'){
		User.findOneAndUpdate({ userId: task.userId }, { $pull: { 'followers' :  task.user  } }, function(err){
			if(!err){
				taskCallback();
			}
		});
	}else if(task.array == 'following'){
		User.findOneAndUpdate({ userId: task.userId }, { $pull: { 'following' :  task.user  } }, function(err){
			if(!err){
				taskCallback();
			}
		});
	}
}, 3);

// assign a callback
q.drain = function() {
    console.log('all relavent users following/followers have been updated');
    User.findOne({ userId: userID }).remove().exec();
	BusinessPie.findOne({ businessPieId: userID }).remove().exec();
	PleasurePie.findOne({ pleasurePieId: userID }).remove().exec();
	ArtistPie.findOne({ artistPieId: userID }).remove().exec();
	Favorites.findOne({ userId: userID }).remove().exec();
	BlackList.findOne({ userId: userID }).remove().exec();
	BusinessGraph.findOne({ pieId: userID }).remove().exec();
	PleasureGraph.findOne({ pieId: userID }).remove().exec();
	ProducerSongs.findOne({ prodId: userID }).remove().exec();
	ProducerSongsGeneral.findOne({ userId: userID }).remove().exec();
	if(res){
		res.status(200).json("User has been deleted " + userID);	
	}else{
		return true;
	}
	
}

	var me = {};
    	User.findOne({ userId: userID }, function(err,doc){
		if(doc){
			console.log("delete user " + userID);
			me.userId = doc.userId;
 			me.username = doc.username;
			me.profileImg = doc.profileImage;
			me.first = doc.firstName;
            me.last = doc.lastName;
            if((doc.followers.length == 0) && (doc.following.length == 0)){	
            	console.log("this user has no following or followers. Simply delete");
            	User.findOne({ userId: userID }).remove().exec();
				BusinessPie.findOne({ businessPieId: userID }).remove().exec();
				PleasurePie.findOne({ pleasurePieId: userID }).remove().exec();
				ArtistPie.findOne({ artistPieId: userID }).remove().exec();
				Favorites.findOne({ userId: userID }).remove().exec();
				BlackList.findOne({ userId: userID }).remove().exec();
				BusinessGraph.findOne({ pieId: userID }).remove().exec();
				PleasureGraph.findOne({ pieId: userID }).remove().exec();
				ProducerSongs.findOne({ prodId: userID }).remove().exec();
				ProducerSongsGeneral.findOne({ userId: userID }).remove().exec();

				if(res){
					res.status(200).json("User has been deleted " + userID);	
				}else{
					return true;
				}

            }
			for(var i=0; i<doc.followers.length; i++){
				//push to queue
				var task = {
					userId: doc.followers[i].userId,
					user: me,
					array: 'following'
				}
					q.push(task, function (err) {
				});
			}

			for(var i=0; i<doc.following.length; i++){
				//push to queue
				var task = {
					userId: doc.following[i].userId,
					user: me,
					array: 'followers'
				}
					q.push(task, function (err) {
				});
			}
		}else{
			if(res){
				res.status(200).json("User " + userID + " does not exsist");
			}else{
				return false;
			}
			
		}
	});



}


//Validate email - ,ake sure its unique
var emailValidation = function (email, id,callback){
	console.log("validate user:" + email + id);
	var emailValid = false;
     User.findOne({ email: email }, function (err, doc) {
     	if (err){
	  	console.log("error at email validation: " + err.message);
	  	callback(emailValid,err);
	  	}else{
	  		if(doc){
	 			console.log("doc:"+doc.userId);
	     	 	if(id == doc.userId){
			  		console.log("id:"+ id + "doc userid:"+ doc.userId);
			  		emailValid = true;
			  	}
	 	 	}else{
	 	 		emailValid = true;
	 	 	}
		}
	  	callback(emailValid,null);
     });	
}



//process form and update users basic info
var editProfileForm = function(req,res,data){
	var update = {};
    	update.firstName = data.firstName;
    	update.lastName = data.lastName
    	update.country = data.country;
        update.ageGroup = data.ageGroup;
        update.profileImage = data.profileImg;

		emailValidation(data.email,data.userID,function(status,err){
			if(err){
				console.log(err);
			}
			console.log("status:"+status);
			if(!status){
				return res.status(200).json({error: "Email is taken, please try again"});
			}else{
		     	update.email = data.email;

        		User.findOneAndUpdate({ 'userId' : data.userID },update,function(err, user) {
		    		if (err){
		    			console.log(err);
		    		}
		        	return res.status(200).json({state:"success"});
				});
     		}

		});
}




//Contiue registration : create MP with initial business/pleasure preferences
var createMP = function(req,res) {
	console.log("Create MP, req.mobile:");
	console.log(req.mobile);

	var MP = {};
    MP.business = {};
    MP.business.preferences =  [
        "Rock",
        "Classical",
        "Country",
        "Latin",
        "Blues",
        "World",
        "Jazz",
        "Reggae",
        "Hip Hop"
    ];
    MP.business.genres = [];
    MP.pleasure = {};
    MP.pleasure.preferences =  [
        "Rock",
        "Pop",
        "rNb",
        "Classical",
        "Country",
        "Electronic",
        "Latin",
        "Blues",
        "World",
        "Punk",
        "Metal",
        "Jazz",
        "Folk",
        "Reggae",
        "Hip Hop"
    ];
    MP.pleasure.genres = [];

    var url;

	async.waterfall([
    //step1 : get user from db
    function(callback) {
    	var update = {is_New: 0};
		User.findOneAndUpdate({ 'userId' : req.user.userId },update,function(err, user) {
		    if (err)
		        console.log(err);

		    if (user) {
		        req.user = user;
		        if(req.user.FB_AT){
		        	console.log("register with facebook, token: " + req.user.FB_AT);
		        	url = "http://52.35.9.144:8082/MP/" + req.user.FB_AT + "/null";
		        }else if(req.user.YT_AT){
		        	console.log("register with google, token: " + req.user.YT_AT);
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
            MP.business.businessPieId = req.user.userId;
            MP.business.genres = obj;
            MP.pleasure.pleasurePieId = req.user.userId;
            MP.pleasure.genres = obj;
            // console.log(MP);
            callback();
          }else if(error){
            console.error("ERROR with request to WS: " + error);
            // res.status(200).json("Sorry, something went wrong... Please try again later.");
			deleteUser(null,req.user.userId);
            res.redirect('/');
            
          }
        });
    },
    //step 3: save preferences recived in form and calculate new pies
     function(callback) {
		
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
			} else {
			    //Not in the array, take this genre out of pie
			    arrB.splice(i, 1);	
			}
		}

		for(var j = arrP.length - 1; j >= 0; j--){
				//check jf category js jn prefs
				if (MP.pleasure.preferences.indexOf(arrP[j].category) > -1) {
				    //jn the array! all good
				} else {
				    //Not jn the array, take thjs genre out of pje
				    arrP.splice(j, 1);	
				}
		}

		//calc new percentages
		var Btotal = 0, Ptotal = 0;
		for(i in arrB){
			Btotal+= arrB[i].artists.length;
		}

		for(i in arrP){
			Ptotal+= arrP[i].artists.length;
		}

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

        callback();
    },

    //step 4:  save new pies to db
   	function(callback) {

        async.waterfall([
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
        ],callback);
    }
    ], function(err) {
        if (err) {
			console.log(err);  
        }
        console.log('New user has been added successfully');
        if(req.mobile){
        	console.log("return user id to app: " + req.user.userId);
        	res.status(200).json(req.user.userId);
        }else{
        	res.redirect('/profile'); 	
        }
		
    });
}





//process form that update the users business/pleasure preferences
var updatePreferences = function(req,res,data) {
	// console.log(data);

	var MP = {};
    MP.business = {};
    MP.business.preferences = [];
    MP.business.genres = [];
    MP.pleasure = {};
    MP.pleasure.preferences = [];
    MP.pleasure.genres = [];

    var arrB = [];
	var arrP = [];

    var url;

	async.waterfall([
    //step1 : get user from db, check what tokens are available (refresh them) and set the correct url to call MP Builder WS
    function(callback) {
    	
        User.findOne({ 'userId' : data.userID },function(err, user) {
		    if (err)
		        console.log(err);

		    if (user) {
		        req.user = user;
		        if(user.FB_AT && user.YT_AT){
					refresh.requestNewAccessToken('google', user.YT_RT, function(err, accessToken, refreshToken) {
		        		if(err){
		        			console.log(err);
		        		}else{
			        		user.YT_AT = accessToken;
			        		console.log("token refreshed");
			        		console.log(accessToken);
			        		if(refreshToken){
			        			user.YT_RT = refreshToken;
			        		}	
		        		}
		        		
		        		url = "http://52.35.9.144:8082/MP/" + user.FB_AT +  "/" + user.YT_AT;
		        		console.log("updatePreferences: update pie with google, token: " + user.YT_AT + " and facebook: " + user.FB_AT);

		        		//save user token
                    	user.save(function (err, doc) {    
                       		if (err) {
                       			var response = {};
                       			response.error = "error saving user pleasure pie: " + err.message;
                         		res.status(200).json(response);
                         		return console.error(err);
                       		}
                       		callback();
                    	});
					});
					
		        }
		        else if(user.FB_AT){
		        	console.log("updatePreferences: update pie with facebook, token: " + user.FB_AT);
		        	url = "http://52.35.9.144:8082/MP/" + user.FB_AT + "/null";
		        }else if(user.YT_AT){
		        	console.log("YT_RT: " + user.YT_RT);
		        	refresh.requestNewAccessToken('google', user.activityToken, function(err, accessToken, refreshToken) {
		        		if(err){
		        			console.log(err);
		        		}else{
			        		user.YT_AT = accessToken;
			        		console.log("token refreshed");
			        		console.log(accessToken);
			        		if(refreshToken){
			        			user.YT_RT = refreshToken;
			        		}	
		        		}

		        		console.log("updatePreferences: update pie with google, token: " + user.YT_AT);
		        		url = "http://52.35.9.144:8082/MP/null/" + user.YT_AT;
		        		console.log(url);
		        		//save user token
                    	user.save(function (err, doc) {    
                       		if (err) {
                         		res.status(200).json("error saving user pleasure pie: " + err.message);
                         		return console.error(err);
                       		}
                       		callback();
                    	});
					});
		        	
		        }
		    } 
		});
    },
    //step 2: creat initial MP (call MP Builder WS)
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
                arrB.push(obj[i]);
                arrP.push(obj[i]);
            }
            body = JSON.stringify([obj]);
            MP.business.businessPieId = data.userID;
            MP.pleasure.pleasurePieId = data.userID;
            callback();
          }else if(error){
             console.error("ERROR with request to WS: " + error);
             var response = {};
   			response.error = "ERROR with request to WS: " + err.message;
     		res.status(200).json(response);
          }
        });
    },
    //step 3: save preferences recived in form 
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


        callback();
    },
    //step 4: get user's favorite list, add all artists to MP
    // function(callback){
    // 	var favorites;
    // 	Favorites.findOne({ userId : data.userID}, function(err, favDoc){
    // 		if (err) {
    //         	res.status(200).json("error saving user business pie: " + err.message);
    //         	callback(err);
    //         }
    //         if(favDoc){
    //         	favorites = favDoc;
				// AllGenres.find({ category: { $exists: true } },function (err, allGenres) {
				// 	if (err) {
				// 	  	callback(err);
				// 	  	return;
				// 	}
					
					
				// 	// create a queue object. the task is requests to last FM and update the MP accordingly
				// 	var q = async.queue(function (artist, queueCallback) {
				// 		// TODO: get the key from a config file
				// 		var lastFM_API_KEY = "5b801a66d1a34e73b6e563afc27ef06b";
				// 		console.log(artist.name);
				// 	    	var encodedParam = encodeURIComponent(artist.name); //safe search: encode to support any language search
				// 			request( "http://ws.audioscrobbler.com/2.0/?method=artist.getTopTags&artist=" + encodedParam + "&api_key="+ lastFM_API_KEY + "&limit=2&format=json", function(error, response, body) {
				// 			if (!error && response.statusCode == 200) {
				// 				var temp = JSON.parse(body);
				// 				if(temp.error){
				// 					console.log(temp.message , artist.name); //if the artist is not valid - print the error message
				// 				}else{
				// 					//artist is valid
				// 					var tags = temp.toptags.tag;
				// 					var tagsSize = tags.length;
				// 					var genresSize = allGenres.length;
				// 					for(var i = 0 ; i < tagsSize ; i++){
				// 						for(var j = 0; j < genresSize; j++) {
				// 							// look for a match between popular last.FM tags and our genres from db. 
				// 						    if ((tags[i].name == allGenres[j].name) && (tags[i].count > 25) ) { 
				// 						    	console.log(tags[i].name);

				// 						    	// check if the genre already exsist in pie
				// 						    	var inPie = false;
				// 						    	BusinessPie.findOne({ businessPieId : data.userID} , function(err,MPbusiness){
				// 									if (err) {
				// 									  	callback(err);
				// 									}
				// 									if(MPbusiness){
				// 								    	for(var k = 0; k<MPbusiness.genres.length; k++){
				// 								    		if(MPbusiness.genres[k].genreName == tags[i].name){
				// 								    			inPie = true;
				// 								    			console.log("genre is in pie: " + tags[i].name);
				// 								    			// check that the artist is not already in the pie under the same genre
				// 								    			for(var z = 0; z <MPbusiness.genres[k].artist; z++){
				// 								    				if(MPbusiness.genres[k].artist[z] == artist.name){
				// 								    					//artist already in pie.
				// 								    					break;
				// 								    				}else{
				// 								    					//artist is not in pie, add him
				// 								    					MPbusiness.genres[k].artist.push(artist.name);
				// 								    				}
				// 								    			}
				// 								    			console.log(MPbusiness);
				// 								    			break;
				// 								    		}
				// 								    	}
				// 								    	if(!inPie){
				// 								    		console.log("genre is new: " + tags[i].name);
				// 								    		//new genre found. create it
				// 								    		var newGenre = {
				// 										        	category: allGenres[j].category,
				// 										            genreName: allGenres[j].name,
				// 										            percent: 0,
				// 										            artists: [],
				// 										            producers: []
				// 										        };

				// 										    newGenre.artists.push(artist.name);
				// 										    MPbusiness.genres.push(newGenre);
				// 						    			}
				// 									}
				// 						    	});
										    	


				// 						    }
				// 						}
				// 					}
				// 				}
				// 				queueCallback();
				// 			  }else{
				// 			  	//problem with request
				// 			  	console.log(response.statusCode);
				// 			  }
				// 			});
				// 	}, 5); //end queue - the task  
		              
				
				// 	// push all artist from favorites
				// 	var len = favorites.songs.length;
				// 	for(var i = 0; i < len; i++) {
				// 		var artist = favorites.songs[i].artist;
				// 		q.push([{ name: artist }], function (err) {
				// 		    console.log('finished processing add new artist to MP task');
				// 		});
				// 	}


				// 	// assign a callback to the queue
				// 	q.drain = function() {
				// 		callback();
				// 	}
				// });
            
    //         }else{
    //         	//no favorites, just move on
    //         	callback();
    //         }
    		
    // 	});
    // },
    //step 5:  save new pies to db
   	function(callback) {

        async.waterfall([
            function(callback) {
                //Save user's business pie
                BusinessPie.findOneAndUpdate({ 'businessPieId' : data.userID }, MP.business, function (err, doc) {
                    if (err) {
                    	res.status(200).json("error saving user business pie: " + err.message);
                    	return console.error(err);
                  	}

                  	for(var i = arrB.length - 1; i >= 0; i--){
						//check if category is in prefs
						if (MP.business.preferences.indexOf(arrB[i].category) > -1) {
						    //In the array! all good
						} else {
						    //Not in the array, take this genre out of pie
						    arrB.splice(i, 1);	
						}
					}

					//calc new percentages
					var Btotal = 0;
					for(i in arrB){
						Btotal+= arrB[i].artists.length;
					}

					for(var j = 0; j<arrB.length; j++){
						arrB[j].percent = (arrB[j].artists.length / Btotal) * 100;
						arrB[j].percent = math.round(arrB[j].percent, 2);
					}

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
                // var pleasure_pie = new PleasurePie(MP.pleasure);
                //Save user's pleasure pie
                PleasurePie.findOneAndUpdate({ 'pleasurePieId' : data.userID },MP.pleasure, function (err, doc) {
                  	if (err) {
                    	res.status(200).json("error saving user pleasure pie: " + err.message);
                    	return console.error(err);
                  	}

                  	for(var j = arrP.length - 1; j >= 0; j--){
						//check jf category js jn prefs
						if (MP.pleasure.preferences.indexOf(arrP[j].category) > -1) {
						    //jn the array! all good
						} else {
						    //Not jn the array, take thjs genre out of pje
						    arrP.splice(j, 1);	
						}
					}

					//calc new percentages
					var Ptotal = 0;
					for(i in arrP){
						Ptotal+= arrP[i].artists.length;
					}

					for(var k = 0; k<arrP.length; k++){
						arrP[k].percent = (arrP[k].artists.length / Ptotal) * 100;
						arrP[k].percent = math.round(arrP[k].percent, 2);
					}

					//update genres in pie
                    doc.genres = arrP; 
                    //save pie
                    doc.save(function (err, doc) {    
                       	if (err) {
                         	res.status(200).json("error saving user pleasure pie: " + err.message);
                         	return console.error(err);
                       	}
                       	console.log("pleasure pie updated");
                       	callback();
                    });
                });
            }

        ],callback);
    },
    //step 6: delete graphs (they will be constructed again in the next request for a playlist)
    function(callback){
    	BusinessGraph.findOne({ userId: data.userID }).remove().exec();
    	PleasureGraph.findOne({ userId: data.userID }).remove().exec();

    	callback();
    }
    ], function(err) {
        if (err) {
			console.log(err);  
        }
        console.log('music preferences have been updated successfully');
        res.status(200).json('music preferences have been updated successfully');
    });
}



//get the producers Uploads from his youtube channel
var getProducerPlaylists = function(YT_AT){
	var list = [];
	request("https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&key=AIzaSyCFLDEh1SbsSvQcgEVHuMOGfKefK8Ko-xc&access_token=" + YT_AT, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var temp = JSON.parse(body);
			// for(i=0; i<temp.items.length; i++){
			// 	list.push({title: temp.items[i].snippet.title, id: temp.items[i].id});
			// }
			// console.log("the list:");
			// console.log(list);
			// return list;	
			return temp.contentDetails.relatedPlaylists.uploads;
		}else{
			console.log("youtube retuered: " , response.statusCode, " error msg: ", response.body);
		}
	});
}





//get all songs from a youtube playlist and insert to DB
var getProducerPlaylistItems = function(playlistID, YT_AT,PlaylistItemsCallback){
	var list = [];
	request("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + playlistID + "&key=AIzaSyCFLDEh1SbsSvQcgEVHuMOGfKefK8Ko-xc&access_token=" + YT_AT, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var temp = JSON.parse(body);
			// console.log(temp);
			for(i=0; i<temp.items.length; i++){
				list.push({
					// songId: i,
					title: temp.items[i].snippet.title,
					videoId: temp.items[i].snippet.resourceId.videoId
				});
			}
			PlaylistItemsCallback(null,list);	
		}else{
			console.log("youtube retuered: " , response.statusCode, " error msg: ", response.body);
			PlaylistItemsCallback(error,null);	
		}
	});
}





//process the producer registration form
var processProducerWizardForm = function(req,res,data){

	async.parallel([

		//save artist name -> username
		//save age group
	    function(callback){
		var update = {username: data.artistName};
    	if (typeof data.ageGroup != 'undefined') {
        	update.ageGroup = data.ageGroup;
        	// console.log("updated user age group to : " + update.ageGroup);
		}
        User.findOneAndUpdate({ 'userId' : data.userID },update,function(err, user) {
		    if (err)
		        console.log(err);
		    if (user) {
		        req.user = user;
		    }

		    callback();
		});
	    },

	    //call getProducerPlaylistItems - populate all songs from youtube 
	    function(callback){
			// console.log("songs from wizard:");
			// console.log(data.list);

				var ProducerSongsDoc = {};

				ProducerSongsDoc.songs = [];
				for(i=0; i<data.list.length; i++){
					var values = data.list[i].split('|');
		    		var videoId = values[0];
		    		var songTitle = values[1];
					ProducerSongsDoc.songs.push({
						songId: i,
						title: songTitle,
						videoId: videoId
					});
				}


				ProducerSongsDoc.prodId = req.user.userId;
				//create new ProducerSongs document with the producer's id
				var temp = new ProducerSongs(ProducerSongsDoc);
				 temp.save(function (err, doc) {
	                  if (err) {
	                    console.log("error saving Producer Songs: " + err.message);
	                  }

	                  //create  producer Songs General Document with all songs counters set to 0
	                  var temp2 = new ProducerSongsGeneral();
	    				temp2.userId = data.userID;
	    				for(var i=0; i< doc.songs.length; i++){
	    					// console.log(doc.songs[i].title);
	    					temp2.songs.push(
									{
										songId: doc.songs[i].songId,
										counterTotal: 0,
							            counterInternal: 0,
							            counterAgeGroup1: 0,    //14 and less
							            counterAgeGroup2: 0,    //15-24
							            counterAgeGroup3: 0,    //25-34
							            counterAgeGroup4: 0,    //35-44
							            counterAgeGroup5: 0,    //45-54
							            counterAgeGroup6: 0,    //55+
							            counterLocal: 0

									}
	    						);
	    				}
		    				temp2.totalCounter = 0 ;
						    temp2.internalCounter = 0 ;
						    temp2.ageGroup1Counter = 0 ;
						    temp2.ageGroup2Counter = 0 ;
						    temp2.ageGroup3Counter = 0 ;
						    temp2.ageGroup4Counter = 0 ;
						    temp2.ageGroup5Counter = 0 ;
						    temp2.ageGroup6Counter = 0 ;
						    temp2.counterLocal

	                  console.log("new Producer Songs Doc is created");
	                  temp2.save(function (err, doc) {
		                  if (err) {
		                    console.log("error saving Producer Songs General: " + err.message);
		                  }
		                  callback();
	              	});
	                  
                });

			// });
	    },

	    //calculate artist pie and save it
	    function(callback){
	    	var total = 0,
	    		num_of_genres = 0;

	    	var temp = new ArtistPie();

	    	temp.artistPieId = data.userID;
	    	// console.log("artist pie id: " + temp.artistPieId);

	    	if(data.genre1 != "null"){
	    		num_of_genres++;
	    		var values = data.genre1.split('|');
	    		var genre = values[0];
	    		var category = values[1];
	    		total += parseInt(data.slider1);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider1});
	    	}
	    	if(data.genre2 != "null"){
	    		num_of_genres++;
	    		var values = data.genre2.split('|');
	    		var genre = values[0];
	    		var category = values[1];
	    		total += parseInt(data.slider2);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider2});
	    	}
	    	if(data.genre3 != "null"){
	    		num_of_genres++;
	    		var values = data.genre3.split('|');
	    		var genre = values[0];
	    		var category = values[1];
	    		total += parseInt(data.slider3);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider3});
	    	}
	    	if(data.genre4 != "null"){
	    		num_of_genres++;
	    		var values = data.genre4.split('|');
	    		var genre = values[0];
	    		var category = values[1];
	    		total += parseInt(data.slider4);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider4});
	    	}
	    	if(data.genre5 != "null"){
	    		num_of_genres++;
	    		var values = data.genre5.split('|');
	    		var genre = values[0];
	    		var category = values[1];
	    		total += parseInt(data.slider5);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider5});
	    	}

	    	for(var i=0; i<temp.genres.length; i++){
	    		temp.genres[i].percent = math.round((temp.genres[i].percent/total)*100,2);
	    	}

	    	temp.save(function (err, doc) {
                  if (err) {
                    console.log("error saving ArtistPie: " + err.message);
                  }
                  callback();
	        });
	    }
	],
	// optional callback
	function(err, results){
	    // all done
	    console.log('New Producer has been added successfully');
		// res.redirect('/BPwizard'); 
		createMP(req,res);
	});

}



//internal function that returns all the users in the system sorted by reg date. also counts how many Consumers and Producers 
var getUsers = function(res){
	User.find({}).sort({registered: 'desc'}).exec(function(err, docs) { 
		var results = {};
		if(docs){
			results.total = docs.length;
			results.total_consumers = 0;
			results.total_producers = 0;
			results.consumers = [];
			results.producers = [];
			for(i in docs){
				if(docs[i].typeOfUser == "Consumer"){
					results.consumers.push({"firstName" : docs[i].firstName,"lastName" : docs[i].lastName,"date" : docs[i].registered, "id" : docs[i].userId});	
					results.total_consumers++;
				}
				else if(docs[i].typeOfUser == "Producer"){
					results.producers.push({"firstName" : docs[i].firstName,"lastName" : docs[i].lastName,"date" : docs[i].registered, "id" : docs[i].userId});	
					results.total_producers++;
				}
				
			}
			res.status(200).json(results);	
		}else{
			res.status(200).json("Something went wrong... :/");	
		}
		
	});
}






module.exports = {
	deleteUser: deleteUser,
	createMP: createMP,
	addToFavorites: addToFavorites,
	getFavorites : getFavorites,
	removeFav : removeFav,
	addToBlackList : addToBlackList,
	updatePreferences : updatePreferences,
	getProducerPlaylists :  getProducerPlaylists,
	getProducerPlaylistItems: getProducerPlaylistItems,
	processProducerWizardForm : processProducerWizardForm,
	getUsers : getUsers,
	editProfileForm : editProfileForm
}

















