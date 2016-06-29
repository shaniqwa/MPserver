
var graph = require('./graph');
var nextsong = require('./nextSong');
var deasync = require('deasync');
var async = require("async");

// var times = 20;
// var mode = 2;
// var uid = 59;
exports.getUserPlaylist = function(res,uid,mode,times,startGenre,oneGenre){
	console.log("DJ: start genre: " + startGenre);
var user = new graph(uid,mode);
user.buildGraph(function(err){
	if(err){
		console.log(err);
	}else{
	console.log("DJ: build graph finished");
	var currGenre = startGenre;

	console.log("DJ: times: " + times);
	var ns = new nextsong(currGenre,uid,mode,user,startGenre,oneGenre);

	async.waterfall([
	    function(callback){
	    	ns.clearPlaylist();
			callNextSong(times,ns,function(err){
				callback();	
			});	
	    }
	    ], 
	    //all is done
	    function(err) {
	        if (err) {
				console.log("DJ: error with dj: " + err);
	        }
			console.log("DJ: the playlist is done. length: "+ ns.getPlaylistLength());
			var result = ns.getPlaylist();
			res.status(200).json(result);   
	    });
	}
});



// while(user.getGraphStatus()  == 0) {
// console.log("waiting");
//    console.log(user.getGraphStatus());
//    require('deasync').sleep(1000);
// }



}


function callNextSong(times,ns, callNextSongCallback) {
	 var inserted = 0;
  for(var i = 0; i < times; i++) {
    (function(i) {
		
		while(ns.getPlaylistLength()  != i) 
		{ //while prev not finished
		// console.log("waiting prev iter to finish");
		require('deasync').sleep(100);
}
	    ns.getNextSong(function(err) {
		  
	      if( err ) {
	        callNextSongCallback(err);
	      }
	      else {
	      	console.log("finished running getNextSong, i = " + i);

	      	if (++inserted == times) {
       			callNextSongCallback();
      		}
	      }
	    });
    })(i);
  }
}

