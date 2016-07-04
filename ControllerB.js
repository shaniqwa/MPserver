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

var artistPieSchema = require("./schemas/scheme_artistPie.js").artistPieSchema; 
var ArtistPie = mongoose.model('Artist_pie', artistPieSchema, 'Artist_pie');

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


// Find Match
// This function searches for match between a given user ID and all producers in DB
var findMatch = function(userID,findMatchC){
	var matchGeners = [];
	console.log("FindMatch start");
	var genres = [];
	console.log(userID);

	async.waterfall([
    function(callback) {
    	PleasurePie.findOne({ pleasurePieId: userID }, function (err, pleasureUser) {
			  if (err || pleasureUser === null){
			  	// console.log(err);
			  	return err;
			  } 
			  for(var i=0; i<pleasureUser.genres.length; i++){
			  	if(genres.indexOf(pleasureUser.genres[i].genreName) === -1){
			  		genres.push(pleasureUser.genres[i].genreName);
			  	}	
			  }	
			   callback();
		});

    },
    function(callback) {
      // arg1 now equals 'one' and arg2 now equals 'two'
      	BusinessPie.findOne({ businessPieId: userID }, function (err, buisnessUser) {
			  if (err || buisnessUser === null){
			  	return err;
			  	// res.status(200).json("error finding buisness pie for user: " + err.message);
			  } 

			  for(var i=0; i<buisnessUser.genres.length; i++){
			  	if(genres.indexOf(buisnessUser.genres[i].genreName) === -1){
			  		genres.push(buisnessUser.genres[i].genreName);
			  	}
			  }

			callback();
	});	
        
    }
], function (err) {
    // all done
	ArtistPie.find({}, function (err, artists) {
	  if (err || artists === null){
	  	return err;
	  	// res.status(200).json("error finding artists: " + err.message);
	  } 
	  
	      artists.forEach(function(artist){
	      	matchGeners = [];
		      	for(var i=0; i<artist.genres.length; i++){
		      		// console.log("categories[i] "+categories[i]);
		      		// console.log("check if genre exsist in user generes:" + artist.genres[i].genreName + "for artist: "  + artist.artistPieId);
		      		if(genres.indexOf(artist.genres[i].genreName) > -1){
		      			console.log("Found Match !");
		      			console.log(artist.genres[i].genreName);
		      			matchGeners.push(artist.genres[i].genreName);
			  		}
		      	}

			    if(matchGeners.length >= 1){
		      		for(var i=0; i< matchGeners.length; i++){
		      			BusinessPie.update({ businessPieId: userID, 'genres.genreName': matchGeners[i] }, {$addToSet: { 'genres.$.producers': artist.artistPieId }} ,false, function (err, doc) {
						  if (err){
						  	// res.status(200).json("error adding producer to BusinessPie: " + err.message);
						  	return err;
						  } 
						});
						

						PleasurePie.update({ pleasurePieId: userID, 'genres.genreName': matchGeners[i] }, {$addToSet: { 'genres.$.producers': artist.artistPieId }} ,false, function (err, doc) {
							  if (err){
							  	// res.status(200).json("error adding producer to PleasurePie: " + err.message);
							  	return err;
							  } 
							   // res.status(200).json("New producer has been added to both pies successfully for user " + userID);
							   return null;
						});
						
		      		}
      			}		
	      });
      	findMatchC(); //callback
	 });//close find all artist pies
	});//end async
}



//Search Specific User
//find one user by username
var searchSpecificUser = function(res,data) {

	User.findOne({ username: data }, function (err, doc) {
	  if (err || doc === null){
	  	res.status(200).json("error searching user: " + err.message);
	  } 
	  // done!
	  console.log("doc "+doc);
	  var result = {username: doc.username, type: doc.typeOfUser, profileImage: doc.profileImage, firstName: doc.firstName, lastName: doc.lastName};
	  console.log(result);
	  res.status(200).json(result);
	});
}



//Srach User
//find any users that match the search string , by first name/ last name / username
var searchuser = function(res,data) {

	User.find({ $or:[ {'username': {$regex: new RegExp(data, "i")} }, {'firstName': {$regex: new RegExp(data, "i")} },{'lastName': {$regex: new RegExp(data, "i")}}	  ]  }, function (err, doc) {
	  if (err || doc === null){
	  	res.status(200).json("error searching substring user: " + err.message);
	  } 
	  // done!
	  var result = [];
	  doc.forEach(function(user){
	  	result.push({userID: user.userId, username: user.username, type: user.typeOfUser, profileImage: user.profileImage, firstName: user.firstName, lastName: user.lastName});
	  });
	  //console.log(result);
	  res.status(200).json(result);
	});
}






//recommandation
//Collects all the matching producers from both of the users pies and return as json
var recommandation = function(res, userID){
	findMatch(userID,function(){
		var producers = [];
		var result = [];
		async.waterfall([
	    function(callback) {
	    PleasurePie.findOne({ pleasurePieId: userID }, function (err, data) {
		  if (err || data === null){
		  	res.status(200).json("error finding pleasur pie for user: " + err.message);
		  } 
		  //console.log(data);
		  	for(var i=0; i<data.genres.length; i++){
			  	for(var j=0; j<data.genres[i].producers.length; j++){
			  		if(producers.indexOf(data.genres[i].producers[j]) == -1){
			  			// producers.push(data.genres[i].producers);
			  			 producers.push( data.genres[i].producers[j]);
			  		}
				}
			}
		  // console.log("done pleasure"); 
		  callback();
	 	});
	        
	    },
	    function(callback) {
	    BusinessPie.findOne({ businessPieId: userID }, function (err, data) {
			  if (err || data === null){
			  	res.status(200).json("error finding buisness pie for user: " + err.message);
			  } 
			 for(var i=0; i<data.genres.length; i++){
			  	for(var j=0; j<data.genres[i].producers.length; j++){
			  		console.log("check if exsist");
			  		console.log(data.genres[i].producers[j]);
			  		if(producers.indexOf(data.genres[i].producers[j]) == -1){
			  		
			  			 producers.push( data.genres[i].producers[j]);
			  		}
				}
			}
			 // console.log("done business");
			 callback();
		});
	        
	    },
	    function(callback){
	    	
	    	var q = async.queue(function (task, taskCallback) {
			    console.log('find ' + task.id);
			    User.findOne({ userId: task.id }, function (err, user) {
			      			if(err){
			      				console.log(err);
			      			}
			      			if(user){
			      				console.log(user);
			      				result.push({username: user.username, profileImage: user.profileImage, userID: user.userId,firstName : user.firstName , lastName: user.lastName, type: user.typeOfUser});		
			      				taskCallback();
			      			}else{
			      				// console.log("user " +producers[i] +" not found");
			      			}
				  			
				  		});
			    
			}, 5);

			// assign a callback
			q.drain = function() {
			    // console.log('all items have been processed');
			    callback();
			}

			if(producers.length == 0){
				callback();
			}
	    		
				for(var i=0; i<producers.length; i++){
			      		console.log("producers[i] "+producers[i]);
			      		q.push({id: producers[i]}, function (err) {
						    // console.log('finished processing ');
						});
			      }

		    }
		], function (err) {
		  	// console.log("result:");
		  	// console.log(result);
		  res.status(200).json(result);
		});
	});

}




//Get users following
var getFollowing = function(res,userId) {
	//addToSet make sure there are no duplicates is songs array.
	User.findOne({ userId: userId }, function (err, doc) {
	  if (err){
	  	res.status(200).json("error getting following: " + err.message);
	  	return err;
	  } 
	  // done!
	  res.status(200).json(doc.following);
	});
}





//Follow
var addToFollow = function(res,Fuser,userF) {
var follower = {};

	async.waterfall([
		// step 1: find me
	    function(callback) {
	    	User.findOne({ userId: Fuser }, function (err, doc) {
				  if (err) {
				  	callback(err);
				  	return;
				  }
				  	
					follower.userId = doc.userId;
	  	 			follower.username = doc.username;
	  				follower.profileImg = doc.profileImage;
	  				follower.first = doc.firstName;
	  	            follower.last = doc.lastName;
	  	            console.log(follower);
	                callback();
			});

	    },	
	    //step 2 : add me as a follower
	    function(callback) {
	    		User.findOneAndUpdate({ userId: userF }, {$addToSet: { followers: follower }} ,{new: true}, function (err, doc) {
				  if (err) {
				  	callback(err);
				  	return;
				  }
				  
					follower.userId = doc.userId;
	  	 			follower.username = doc.username;
	  				follower.profileImg = doc.profileImage;
	  				follower.first = doc.firstName;
	  	            follower.last = doc.lastName;
	                callback();
			});

	    },
	    //step 3: add other user to my following
	    function(callback){
	    		User.findOneAndUpdate({ userId: Fuser }, {$addToSet: { following: follower }} ,{new: true}, function (err, doc) {
				  if (err) {
				  	callback(err);
				  	return;
				  }
	                callback();
			});

	    }
	], function(err) {
	    if (err) {
	        throw err; //Or pass it on to an outer callback, log it or whatever suits your needs
	    }
	    console.log("added to following");
	    res.status(200).json("added to following");
	});
}


//Unfollow
var unfollow = function(res,Fuser,userF) {
var follower = {};

	async.waterfall([
		// step 1: find me
	    function(callback) {
	    	User.findOne({ userId: Fuser }, function (err, doc) {
				  if (err) {
				  	callback(err);
				  	return;
				  }
				  	
					follower.userId = doc.userId;
	  	 			follower.username = doc.username;
	  				follower.profileImg = doc.profileImage;
	  				follower.first = doc.firstName;
	  	            follower.last = doc.lastName;
	  	            // console.log(follower);
	                callback();
			});

	    },	
	    //step 2 : remove me from other user's followers
	    function(callback) {

	    	User.findOneAndUpdate({ userId: userF }, { $pull: { 'followers':  follower  } }, function (err, doc) {
				if (err) {
				  	callback(err);
				  	return;
				  }
				  
					follower.userId = doc.userId;
	  	 			follower.username = doc.username;
	  				follower.profileImg = doc.profileImage;
	  				follower.first = doc.firstName;
	  	            follower.last = doc.lastName;
	                callback();
			});
	    },
	    //step 3: add other user to my following
	    function(callback){

	    	User.findOneAndUpdate({ userId: Fuser }, { $pull: { 'following':  follower  } }, function (err, doc) {
				if (err) {
				  	callback(err);
				  	return;
				  }
	                callback();
			});
	    		

	    }
	], function(err) {
	    if (err) {
	        throw err; //Or pass it on to an outer callback, log it or whatever suits your needs
	    }
	    console.log("unfollow");
	    res.status(200).json("unfollow");
	});
}



//Delete song from favorite
var removeFav = function(res, data){
	Favorites.update({ userId: data.userID }, { $pull: { 'songs': { song: data.songs.song } } },function(err,doc){
		res.status(200).json("Song has been deleted " + userID);
	});
}


var whoToFollow = function(userId,callback){
	console.log("whoToFollow");
	var result = {};
	result.friends = [];
	result.error = false;
	User.findOne({userId : userId}, function(err, doc){
		if(err){
			console.log(err);
			result.error = err;
			callback(result,null);
		}else if(doc){
			var url =  "https://graph.facebook.com/v2.6/" + doc.FB_id+ "/friends?fields&access_token=" +  doc.FB_AT;
			request.get(url, function (error, response, body) {
		          if (!error && response.statusCode == 200) {
		          		var obj = body.toString();
		                obj = JSON.parse(obj);

		                //the queue: find each friend in the DB based on his FB_id
		                var q = async.queue(function (task, taskCallback) {
							User.findOne( { "FB_id": task.FB_id } , function(err,user){
								if(err){
									console.log(err);
									taskCallback(err);
								}
								if(user){
									result.friends.push({"firstName" : user.firstName , "lastName" : user.lastName, "userId" : user.userId, "profileImage" : user.profileImage});
									taskCallback();
								}else{
									taskCallback();
								}
							});
					}, 3);


		            q.drain = function() {
		            	callback(null,result);
		            }

		            for(i in obj.data){
						//push to queue
						var task = {};
						task.FB_id = obj.data[i].id;
							q.push(task, function (err) {
								if(err){
									result.error = true;
									console.log(err);
									callback(result,null);
								}
						});
					}

		          }else if(error){
		            console.error("ERROR with whoToFollow: " + error);
		            result.error = "ERROR with whoToFollow: " + error;
		            callback(result,null);
		          }
		      });

		}else{
			console.log("whoToFollow: no user found with id " + userId);
			result.error = "whoToFollow: no user found with id " + userId;
			callback(result,null);
		}
	


	});

}


module.exports = {
	findMatch : findMatch,
	searchSpecificUser : searchSpecificUser,
	searchuser : searchuser,
	recommandation : recommandation,
	getFollowing : getFollowing,
	addToFollow : addToFollow,
	unfollow : unfollow,
	removeFav : removeFav,
	whoToFollow : whoToFollow
}
