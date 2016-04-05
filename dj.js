
var graph = require('./graph');
var nextsong = require('./nextSong');
var deasync = require('deasync');
var async = require("async");

// var times = 20;
// var mode = 2;
// var uid = 59;
exports.getUserPlaylist = function(res,uid,mode,times,startGenre){
var user = new graph(uid,mode);
user.buildGraph();
//console.log(user.getGraph());
//genre,userid,p/b
var currGenre = startGenre;

console.log("times: " + times);


while(user.getGraphStatus()  == 0) {
console.log("waiting");
   console.log(user.getGraphStatus());
   require('deasync').sleep(1000);
}

var ns = new nextsong(currGenre,uid,mode,user,startGenre);

    async.waterfall([
    //step1 : create user and get his id
	function(callback) {
		ns.clearPlaylist();
		console.log("length after clear: " + ns.getPlaylistLength());
		callback();	
    },
    //step 2
    function(callback){
		for(var i=0; i<times; i++) {
			ns.getNextSong();
			require('deasync').sleep(2000);
		}
		callback();
    }
    ], 
    //all is done
    function(err) {
        if (err) {
			console.log("error with dj: " + err);
        }
		console.log("the playlist is done. length: "+ ns.getPlaylistLength());
		var result = ns.getPlaylist();
		res.status(200).json(result);   
    });

}

//after we change getNextSong so that it recives a callback, we can use this code instead of the for loop (line 39) 
//pass i=0 and times= number of times we want to call getNextSong
function callNextSong(i, times) {
  if( i < times ) {
    ns.getNextSong(function(err) {
      if( err ) {
        console.log('error: '+err)
      }
      else {
        callNextSong(i+1)
      }
    })
  }
}

