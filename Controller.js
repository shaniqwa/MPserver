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

//===============MODELS===============
var usersSchema = require("./schemas/scheme_users.js").usersSchema; 
var User = mongoose.model('User', usersSchema, 'Users');

usersSchema.plugin(autoIncrement.plugin, { model: 'Users', field: 'userId' });

var businessPieSchema = require("./schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');

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




//===============FUNCTIONS===============

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

	//remove user from all following users, by cheking the deleted user followers 
	var q = async.queue(function (task, taskCallback) {
    console.log('remove from followers ' + task.userId);

	User.findOneAndUpdate({ userId: task.userId }, { $pull: { 'following':  task.user  } }, function(err){
		if(!err){
			taskCallback();
		}
	});
}, 5);

// assign a callback
q.drain = function() {
    console.log('all items have been processed');
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

	res.status(200).json("User has been deleted " + userID);
}

	var me = {};
    	User.findOne({ userId: userID }, function(err,doc){
		if(doc){
			me.userId = doc.userId;
 			me.username = doc.username;
			me.profileImg = doc.profileImage;
			me.first = doc.firstName;
            me.last = doc.lastName;
			for(i in doc.followers){
				//push to queue
				q.push({userId: i.userId, user: me}, function (err) {
			    console.log('finished processing ');
			});
			}
		}
	});



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
    	var update = {is_New: 0};
    	if (typeof data.ageGroup != 'undefined') {
        	update.ageGroup = data.ageGroup;
        	// console.log("updated user age group to : " + update.ageGroup);
		}
        User.findOneAndUpdate({ 'userId' : data.userID },update,function(err, user) {
		    if (err)
		        console.log(err);

		    if (user) {
		        req.user = user;
		        if(req.user.FB_AT){
		        	url = "http://52.35.9.144:8082/MP/" + req.user.FB_AT + "/null";
		        }else if(req.user.YT_AT){
		        	console.log("register with google, token: " + req.user.YT_AT);
		        	url = "http://52.35.9.144:8082/MP/null/" + req.user.YT_AT;
		        	console.log(url);
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
            return console.error("ERROR with request to WS: " + error);
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

            // step 5 - findMatch
    	function(callback){
    		ControllerB.findMatch( data.userID , function(){
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
}


exports.getProducerPlaylists = function(YT_AT){
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
		}
	});
}

//get all songs from a youtube playlist and insert to DB
exports.getProducerPlaylistItems = function(playlistID, YT_AT,PlaylistItemsCallback){
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
			PlaylistItemsCallback(error,null);	
		}
	});
}

exports.processProducerWizardForm = function(req,res,data){

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
	    	// console.log("selected playlist id: ");
	    	// console.log(data.playlistID);
			console.log("songs from wizard:");
			console.log(data.list);

			// getProducerPlaylistItems(playlistID, req.user.YT_AT,function(error, list){
				// if(error){
				// 	console.log(error);
				// }
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
	    		// console.log(genre);
	    		// console.log(category);
	    		// console.log(data.slider1);
	    		total += parseInt(data.slider1);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider1});
	    	}
	    	if(data.genre2 != "null"){
	    		num_of_genres++;
	    		var values = data.genre2.split('|');
	    		var genre = values[0];
	    		var category = values[1];
	    		// console.log(genre);
	    		// console.log(category);
	    		// console.log(data.slider2);
	    		total += parseInt(data.slider2);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider2});
	    	}
	    	if(data.genre3 != "null"){
	    		num_of_genres++;
	    		var values = data.genre3.split('|');
	    		var genre = values[0];
	    		var category = values[1];
	    		// console.log(genre);
	    		// console.log(category);
	    		// console.log(data.slider3);
	    		total += parseInt(data.slider3);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider3});
	    	}
	    	if(data.genre4 != "null"){
	    		num_of_genres++;
	    		var values = data.genre4.split('|');
	    		var genre = values[0];
	    		var category = values[1];
	    		// console.log(genre);
	    		// console.log(category);
	    		// console.log(data.slider4);
	    		total += parseInt(data.slider4);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider4});
	    	}
	    	if(data.genre5 != "null"){
	    		num_of_genres++;
	    		var values = data.genre5.split('|');
	    		var genre = values[0];
	    		var category = values[1];
	    		// console.log(genre);
	    		// console.log(category);
	    		// console.log(data.slider5);
	    		total += parseInt(data.slider5);	
	    		temp.genres.push({category: category, genreName: genre, percent: data.slider5});
	    	}
	    	// console.log("total: " + total);
	    	// console.log("num_of_genres: " + num_of_genres);

	    	for(var i=0; i<temp.genres.length; i++){
	    		temp.genres[i].percent = math.round((temp.genres[i].percent/total)*100,2);
	    		// console.log(temp.genres[i]);
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
		res.redirect('/BPwizard'); 
	});

}






























