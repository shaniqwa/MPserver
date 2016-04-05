
var graph = require('./graph');
var nextsong = require('./nextSong');
var deasync = require('deasync');

// var times = 20;
// var mode = 2;
// var uid = 59;
exports.getUserPlaylist = function(res,uid,mode,times,startGenre){
var user = new graph(uid,mode);
user.buildGraph();
//console.log(user.getGraph());
//genre,userid,p/b
var currGenre = "rock";
startGenre = "pop";




while(user.getGraphStatus()  == 0) {
console.log("waiting");
   console.log(user.getGraphStatus());
   require('deasync').sleep(1000);
}

var ns = new nextsong(currGenre,uid,mode,user,startGenre);

for(var i=0; i<times; i++) {
ns.getNextSong();
require('deasync').sleep(1000);
}

  while(ns.getPlaylistLength()  < times) {
    require('deasync').sleep(1000);
    var temp = ns.getPlaylistLength();
    console.log(temp);
  }
console.log("***length array of songs: " + ns.getPlaylistLength());

//console.log(user.getGraph());
console.log("the playlist is done");
// console.log(ns.getPlaylist());
var result = ns.getPlaylist();
res.status(200).json(result);
}




