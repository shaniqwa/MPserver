var MongoClient = require('mongodb').MongoClient,
    format = require('util').format;
var Random = require('random-js');
var request = require('sync-request');
var graphInit = require('./graph');

//variables
var currGenre;
var user;
var mode;
var userGraph;
var playlist = [];
var uId;
var IWantToKillMyself;
var ng;
//var flagFinish;
var runs = 0;
var engine = Random.engines.mt19937().autoSeed();
// constructor
function nextSong(currGenre, user, mode,userGraph, startGenre) {
    this.currGenre = currGenre;
    this.user = parseInt(user);
    this.mode = parseInt(mode);
    this.userGraph = userGraph;
    this.startGenre = startGenre;
    this.playlist = [];
    this.flagFinish = 0;
    //console.log("[]initialized");
}


nextSong.prototype.getPlaylistLength = function(){
  return playlist.length;
};

nextSong.prototype.getPlaylist = function(){
  return playlist;
};


// methods
nextSong.prototype.getNextSong = function() {
    //console.log("[]getting next song,connecting to DB");
    //console.log("[]checking if existing genre..");
    this.connectDB(this.currGenre, this.user, this.mode,this.userGraph, this.startGenre);
}


function pickChoice(choice) {
    var sum = 0;
    for (chs in choice) {
        sum += parseInt(choice[chs][0]);
    }
    var choices = choice;
    rand = Math.floor(Math.random() * sum);
    choice = -1;

    for (i = 0; i < choices.length; i++) {

        // set up min
        if (i === 0) {
            min = 0;
        } else {
            min = 0;
            // add up all the values so far
            for (i2 = 0; i2 < i; i2++) {
                min += choices[i2][0];
            }
            // one higher
            min++;
        }

        // set up max
        if (i === 0) {
            max = choices[i][0];
        } else {
            max = 0;
            // add up all the values so far
            for (i2 = 0; i2 < i + 1; i2++) {
                max += choices[i2][0];
            }
        }

        if (rand >= min && rand <= max) {
            choice = i;
            break;
        }

    }
    return choices[choice][1];
    // If the choice is still -1 here, something went wrong...

};

function pickProducerConsumer() {
    var relations = [
        [20, "producers"],
        [80, "artists"]
    ];
    return pickChoice(relations);
};

function pickArtistOrSimiliar() {
    var relations = [
        [50, "thisArtist"],
        [50, "similiar"]
    ];
    return pickChoice(relations);
};


function getRandArtist(type, userObject, currGenre) {
    //console.log("this is the user object : ");
    //console.log(userObject);
    for (obj in userObject) {
        //console.log(userObject[obj].genreName); // for tests
        if (userObject[obj].genreName == currGenre) { // our genre
            var distribution = Random.integer(0, userObject[obj][type].length - 1);
            return userObject[obj][type][distribution(engine)];
        }
    }
    //console.log(userObject);
};


function getRandTrack(artist) { // todo validations
    //console.log("[]sending request for top tracks");
    var res = request('GET', 'http://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&autocorrect=1&limit=1000&artist=' + encodeURIComponent(artist) + '&api_key=5b801a66d1a34e73b6e563afc27ef06b&format=json');
    //console.log(JSON.parse(res.getBody('utf8')));
    console.log("the artist sent :" + artist);
    var tracks = JSON.parse(res.getBody('utf8')).toptracks.track;
    var theSong = Random.pick(engine, tracks, 0, tracks.length);
    return theSong;
};

function getSimilarArtist(artist) {
    //console.log("[]sending request for similiar artists");
    var res = request('GET', 'http://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&autocorrect=1&limit=50&artist=' + encodeURIComponent(artist) + '&api_key=5b801a66d1a34e73b6e563afc27ef06b&format=json');
    //console.log(JSON.parse(res.getBody('utf8')));
    console.log("the artist sent :" + artist);
    var artists = JSON.parse(res.getBody('utf8')).similarartists.artist;
    var theArtist = Random.pick(engine, artists, 0, artists.length);
    return theArtist;
};

function getRandTrackProducer(arrSongs) {
    //var tracks = JSON.parse(res.getBody('utf8')).toptracks.track;
    var theSong = Random.pick(engine, arrSongs, 0, arrSongs.length);
    return theSong;
};

nextSong.prototype.connectDB = function(currGenre, user, mode,userGraph,startGenre) {
    if (runs != 0) {
        if (IWantToKillMyself == false) { currGenre = ng; }
    else {

        currGenre = IWantToKillMyself;
    }
    }
    //this.currGenre = (IWantToKillMyself == false) ?  ng : IWantToKillMyself; currGenre = this.currGenre;}
    
    runs = parseInt(runs) + 1;
    //console.log("************************** currGenre is: " + currGenre + " IWantToKillMyself is: " +IWantToKillMyself + "ng is" + ng);
    MongoClient.connect('mongodb://52.35.9.144:27017/musicprofile', function(err, db) {
        if (err) {
            throw err;
        } else {
            //console.log("[]successfully connected to the database");
            var collection = db.collection('Users');
            collection.findOne({
                userId: user
            }, function(err, document) {
                if (err) { //user not found
                    throw err;
                } else { //found user
                    if (mode == 1) { // pleasure, now extract all data of pie
                       // //console.log(document);
                        uId = document.userId;
                        //console.log("[]extracting pleasurePieId of ID : " + document.userId);
                        collection = db.collection('Pleasure_pie');
                        collection.findOne({
                            pleasurePieId: document.userId
                        }, function(err, document) {
                            if (err) { // didn't found pie datadddd
                                throw err;
                            } else { //found pie data
                                //console.log("[]extracting pie data :");
                                 // to declare as private attr
                                //console.log("this is the uid:" + uId);
                                var count = document.genres.length;
                                var results = [];
                                for (var i = 0; i < count; i++) {
                                    //console.log("- found percents:" + Math.floor(document.genres[i].percent));
                                    results.push([Math.floor(document.genres[i].percent), document.genres[i].genreName]);
                                }
                                var newGenre = pickChoice(results);
                                //console.log("[]picked randomaly by percents: " + newGenre);
                                if (currGenre == newGenre) {
                                    //console.log("same genre choosen"); //if stay in same genre
                                    //choose producer or known artist
                                    var prodOrConsumer = pickProducerConsumer();
                                    //console.log("picked : " + prodOrConsumer);
                                    if (prodOrConsumer == "artists") { // known artist
                                        //choose random artist
                                        //console.log(document.genres);
                                        var randArtist = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("this is the rand artist: " + randArtist);
                                        // choose song of this one or similiar
                                        var artistOrSimiliar = pickArtistOrSimiliar();
                                        if (artistOrSimiliar == "thisArtist") { // find song of this artist 

                                            //console.log("getting song from picked artist: " + randArtist);
                                            var chsnSongArtist = getRandTrack(randArtist);
                                            //console.log("song choosen : ");
                                            //console.log(chsnSongArtist);
                                            playlist.push(  chsnSongArtist  );
                                            playlist.push( { genrename : currGenre });
                                            //console.log("length of playlist:" + playlist.length);
                                            //console.log("the playlist:");
                                            //console.log(playlist);
                                            //console.log("**changing flag");
                                            //flagFinish = 1;
                                            
                                            
                                        } else { // find similar artist
                                            //console.log("getting similar artist of randartistname: " + randArtist);
                                            var artistSimiliar = getSimilarArtist(randArtist);
                                            //console.log("this is the artist similar:");
                                            //console.log("getting song of artist similar: ");
                                            //console.log(artistSimiliar);
                                            var chsnSongSimilar = getRandTrack(artistSimiliar);
                                            //console.log("song choosen : ");
                                            //console.log(chsnSongSimilar);
                                            playlist.push(  chsnSongSimilar );
                                            //console.log("length of playlist:" + playlist.length);
                                            //console.log("the playlist:");
                                            //console.log(playlist);
                                            //console.log("**changing flag");
                                            //flagFinish = 1;

                                        }
                                    } else { // producer
                                        //console.log("implement if producer");
                                        var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random producer : ");
                                        //console.log(randArtistProducer);

                                        var collection = db.collection('Users');
                                        collection.findOne({
                                            username: randArtistProducer
                                        }, function(err, document) {
                                            if (err) { //user not found
                                                throw err;
                                            } else {
                                                //console.log(document.userId); 
                                                collection = db.collection('Producer_songs_list');
                                                collection.findOne({
                                                    prodId: document.userId
                                                }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
                                                        //console.log(document.songs);
                                                        //console.log("picked rand song of producer: ");
                                                        //console.log(getRandTrackProducer(document.songs));
                                                        playlist.push(getRandTrackProducer(document.songs));
                                                        playlist.push( { genrename : currGenre});
                                                        //console.log("the playlist:");
                                                        //console.log(playlist);
                                                        //console.log("**changing flag");
                                                        //flagFinish = 1;

                                                    }
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    //console.log("getting next genre from graph");
                                    //console.log("the graph********");
                                    //console.log(this.currGenre);
                                    //console.log(userGraph.getGraph());
                                    var pickedGenre = userGraph.nextGenre(user,startGenre,currGenre);
                                     IWantToKillMyself = pickedGenre;
                                      //console.log("IWantToKillMyself = pickedGenre  ==>" + IWantToKillMyself + "=" + pickedGenre);
                                    //connectDB(pickedGenre, this.user, this.mode,this.userGraph, this.startGenre);
                                    console.log("# the returned value is: " + pickedGenre);
                                    if (pickedGenre == false) { //switch genre and get song
                                        //console.log("cant find genre" + pickedGenre);
                                        
                                        // if rafi returned false
                                //console.log(document);
                                //console.log("extracting pleasurePieId of ID aa : " + uId);
                                collection = db.collection('Pleasure_pie');
                                collection.findOne({
                                pleasurePieId: uId
                                }, function(err, document) {
                                if (err) { // didn't found pie data
                                throw err;
                                } else { //found pie data
                                //console.log("extracting pie data :");
                                //console.log(document);
                                var count = document.genres.length;
                                var results = [];
                                for (var i = 0; i < count; i++) {
                                    //console.log("found percents:" + Math.floor(document.genres[i].percent));
                                    results.push([Math.floor(document.genres[i].percent), document.genres[i].genreName]);
                                }
                                var newGenre = pickChoice(results);
                                ng = newGenre;
                                //console.log("picked randomaly by percents after rafi returned false: " + newGenre);
                                
                            
                                    //choose producer or known artist
                                    var prodOrConsumer = pickProducerConsumer();
                                    //console.log("picked : " + prodOrConsumer);
                                    if (prodOrConsumer == "artists") { // known artist
                                    //console.log(document.genres);
                                        //choose random artist
                                        var randArtist = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random artist : ");
                                        //console.log("this is the rand artist: " + randArtist);
                                        // choose song of this one or similiar
                                        var artistOrSimiliar = pickArtistOrSimiliar();
                                        if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                            //console.log("getting song from picked artist: " + randArtist);
                                            var chsnSongArtist = getRandTrack(randArtist);
                                            //console.log("song choosen : ");
                                            
                                            //console.log(chsnSongArtist);
                                            playlist.push(chsnSongArtist);
                                            //playlist.push( { genrename : currGenre});
                                            //console.log("length of playlist:" + playlist.length);
                                            //console.log("**changing flag");
                                            //flagFinish = 1;
                                            //console.log("the playlist:");
                                            //console.log(playlist);
                                        } else { // find similar artist
                                            //console.log("picking song of similiar artist:");
                                            //console.log(randArtist);
                                            var artistSimiliar = getSimilarArtist(randArtist);
                                            //console.log("getting song of artist similar: ");
                                            //console.log(artistSimiliar);
                                            var chsnSongSimilar = getRandTrack(artistSimiliar);
                                            //console.log("song choosen : ");
                                            //console.log(chsnSongSimilar);
                                            playlist.push(chsnSongSimilar);
                                            //playlist.push( { genrename : currGenre});
                                            //console.log("length of playlist:" + playlist.length);
                                            //console.log("**changing flag");
                                            //flagFinish = 1;
                                            //console.log("the playlist:");
                                            //console.log(playlist);
                                            }
                                            } else { // producer
                             
                                        var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random producer : ");
                                        //console.log(randArtistProducer);

                                        var collection = db.collection('Users');
                                        collection.findOne({
                                            username: randArtistProducer
                                        }, function(err, document) {
                                            if (err) { //user not found
                                                throw err;
                                            } else {
                                                //console.log(document.userId); 
                                                collection = db.collection('Producer_songs_list');
                                                collection.findOne({
                                                    prodId: document.userId
                                                }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
                                                        //console.log(document.songs);
                                                        //console.log("picked rand song of producer: ");
                                                        //console.log(getRandTrackProducer(document.songs));
                                                        playlist.push(getRandTrackProducer(document.songs));
                                                        //console.log("the playlist:");
                                                        //console.log(playlist);

                                                    }
                                                });
                                            }
                                        });
                                    }
                                
                                
                                }
                                });
                                
                                
                                
                                        
                                        
                                    } else { // get song of returned genre
                                        //console.log("the returned genre from rafi is " + pickedGenre);
                                        
                                        
                                        
                                        
                                        
                                     //choose producer or known artist
                                    var prodOrConsumer = pickProducerConsumer();
                                    //console.log("picked : " + prodOrConsumer);
                                    if (prodOrConsumer == "artists") { // known artist
                                        //choose random artist
                                        var randArtist = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random artist : ");
                                        //console.log(randArtist);
                                        // choose song of this one or similiar
                                        var artistOrSimiliar = pickArtistOrSimiliar();
                                        if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                            //console.log("getting song from picked artist: " + randArtist);
                                            var chsnSongArtist = getRandTrack(randArtist);
                                            //console.log("song choosen : ");
                                            //console.log(chsnSongArtist);
                                            playlist.push(chsnSongArtist);
                                            //console.log("**changing flag");
                                            //flagFinish = 1;
                                            //console.log("the playlist:");
                                            //console.log(playlist);
                                        } else { // find similar artist
                                            //console.log("picking song of similiar artist");
                                            //console.log(randArtist.artistName);
                                            var artistSimiliar = getSimilarArtist(randArtist);
                                            //console.log("getting song of artist similar: ");
                                            //console.log(artistSimiliar);
                                            var chsnSongSimilar = getRandTrack(artistSimiliar);
                                            //console.log("song choosen : ");
                                            playlist.push(chsnSongSimilar);
                                            //console.log("**changing flag");
                                            //flagFinish = 1;
                                            //console.log("the playlist*****:" + playlist.length);
                                            //console.log(playlist);
                                            //console.log(chsnSongSimilar);
                                            }
                                            } else { // producer
                             
                                        var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random producer : ");
                                        //console.log(randArtistProducer);

                                        var collection = db.collection('Users');
                                        collection.findOne({
                                            username: randArtistProducer
                                        }, function(err, document) {
                                            if (err) { //user not found
                                                throw err;
                                            } else {
                                                //console.log(document.userId); 
                                                collection = db.collection('Producer_songs_list');
                                                collection.findOne({
                                                    prodId: document.userId
                                                }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
                                                        //console.log(document.songs);
                                                        //console.log("picked rand song of producer: ");
                                                        //console.log(getRandTrackProducer(document.songs));
                                                        playlist.push(getRandTrackProducer(document.songs));
                                                        //console.log("**changing flag");
                                                        //flagFinish = 1;
                                                        //console.log("the playlist:" + playlist.length);
                                                        //console.log(playlist);

                                                    }
                                                });
                                            }
                                        });
                                    }
                                        
                                        
                                        
                                    }
                                } 
                            }
                        });

                    } else { //business, now extract all data of pie 
                        uId = document.userId;
                    
                        //console.log("extracting businessePieId of ID : " + uId);
                        collection = db.collection('Business_pie');
                        collection.findOne({
                            businessPieId: uId
                        }, function(err, document) {
                            if (err) { // didn't found pie data
                                throw err;
                            } else { //found pie data
                                //console.log("extracting pie data :");
                                var count = document.genres.length;
                                var results = [];
                                for (var i = 0; i < count; i++) {
                                    //console.log("- found percents:" + Math.floor(document.genres[i].percent));
                                    results.push([Math.floor(document.genres[i].percent), document.genres[i].genreName]);
                                }
                                var newGenre = pickChoice(results);
                                //console.log("picked randomaly by percents: " + newGenre);
                                if (currGenre == newGenre) {
                                    //console.log("same genre choosen"); //if stay in same genre
                                    //choose producer or known artist
                                    var prodOrConsumer = pickProducerConsumer();
                                    //console.log("picked : " + prodOrConsumer);
                                    if (prodOrConsumer == "artists") { // known artist
                                        //choose random artist
                                        var randArtist = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random artist : ");
                                        //console.log(randArtist);
                                        // choose song of this one or similiar
                                        var artistOrSimiliar = pickArtistOrSimiliar();
                                        if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                            //console.log("getting song from picked artist: " + randArtist);
                                            var chsnSongArtist = getRandTrack(randArtist);
                                            //console.log("song choosen : ");
                                            playlist.push(chsnSongArtist);
                                            //console.log(chsnSongArtist);
                                        } else { // find similar artist
                                            //console.log("picking song of similiar artist");
                                            //console.log(randArtist.artistName);
                                            var artistSimiliar = getSimilarArtist(randArtist);
                                            //console.log("getting song of artist similar: ");
                                            //console.log(artistSimiliar);
                                            var chsnSongSimilar = getRandTrack(artistSimiliar);
                                            //console.log("song choosen : ");
                                            playlist.push(chsnSongSimilar);
                                            //console.log(chsnSongSimilar);

                                        }
                                    } else { // producer
                                        var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random producer : ");
                                        //console.log(randArtistProducer);

                                        var collection = db.collection('Users');
                                        collection.findOne({
                                            username: randArtistProducer
                                        }, function(err, document) {
                                            if (err) { //user not found
                                                throw err;
                                            } else {
                                                //console.log(document.userId); 
                                                collection = db.collection('Producer_songs_list');
                                                collection.findOne({
                                                    prodId: document.userId
                                                }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
                                                        //console.log(document.songs);
                                                        //console.log("picked rand song of producer: ");
                                                        //console.log(getRandTrackProducer(document.songs));
                                                        playlist.push(getRandTrackProducer(document.songs));

                                                    }
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    //console.log("getting next genre from graph");
                                    //console.log("the graph********");
                                    //console.log(userGraph.getGraph());
                                    var pickedGenre = userGraph.nextGenre(user,startGenre,currGenre);
                                    IWantToKillMyself = pickedGenre;
                                    //console.log("IWantToKillMyself = pickedGenre  ==>" + IWantToKillMyself + "=" + pickedGenre);
                                    //connectDB(pickedGenre, this.user, this.mode,this.userGraph, this.startGenre);
                                    //console.log("# the returned value is: " + pickedGenre);
                                    //pickedGenre = "electro"; // for tests only!!
                                    if (pickedGenre == false) { //switch genre and get song
                                        //console.log("cant find genre" + pickedGenre);
                                        
                                        // if rafi returned false
                                //console.log("extracting businessPieId of ID : " + uId);
                                collection = db.collection('Business_pie');
                                collection.findOne({
                                businessPieId: uId
                                }, function(err, document) {
                                if (err) { // didn't found pie data
                                throw err;
                                } else { //found pie data
                                //console.log("extracting pie data :");
                                var count = document.genres.length;
                                var results = [];
                                for (var i = 0; i < count; i++) {
                                    //console.log("found percents:" + Math.floor(document.genres[i].percent));
                                    results.push([Math.floor(document.genres[i].percent), document.genres[i].genreName]);
                                }
                                var newGenre = pickChoice(results);
                                ng = newGenre;
                                //console.log("picked randomaly by percents after rafi returned false: " + newGenre);
                                
                            
                                    //choose producer or known artist
                                    var prodOrConsumer = pickProducerConsumer();
                                    //console.log("picked : " + prodOrConsumer);
                                    if (prodOrConsumer == "artists") { // known artist
                                        //choose random artist
                                        var randArtist = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random artist : ");
                                        //console.log(randArtist);
                                        // choose song of this one or similiar
                                        var artistOrSimiliar = pickArtistOrSimiliar();
                                        if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                            //console.log("getting song from picked artist: " + randArtist);
                                            var chsnSongArtist = getRandTrack(randArtist);
                                            //console.log("song choosen : ");
                                            playlist.push(chsnSongArtist);
                                            //console.log(chsnSongArtist);
                                        } else { // find similar artist
                                            //console.log("picking song of similiar artist");
                                            //console.log(randArtist.artistName);

                                            var artistSimiliar = getSimilarArtist(randArtist);
                                            //console.log("getting song of artist similar: ");
                                            //console.log(artistSimiliar);
                                            var chsnSongSimilar = getRandTrack(artistSimiliar.name);
                                            //console.log("song choosen : ");
                                            playlist.push(chsnSongSimilar);
                                            //console.log(chsnSongSimilar);
                                            }
                                            } else { // producer
                             
                                        var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random producer : ");
                                        //console.log(randArtistProducer);

                                        var collection = db.collection('Users');
                                        collection.findOne({
                                            username: randArtistProducer
                                        }, function(err, document) {
                                            if (err) { //user not found
                                                throw err;
                                            } else {
                                                //console.log(document.userId); 
                                                collection = db.collection('Producer_songs_list');
                                                collection.findOne({
                                                    prodId: document.userId
                                                }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
                                                        //console.log(document.songs);
                                                        //console.log("picked rand song of producer: ");
                                                        //console.log(getRandTrackProducer(document.songs));
                                                        playlist.push(getRandTrackProducer(document.songs));

                                                    }
                                                });
                                            }
                                        });
                                    }
                                
                                
                                }
                                });
                                
                                
                                
                                        
                                        
                                    } else { // get song of returned genre
                                        //console.log("the returned genre from rafi is " + pickedGenre);
                                        
                                        
                                        
                                        
                                        
                                     //choose producer or known artist
                                    var prodOrConsumer = pickProducerConsumer();
                                    //console.log("picked : " + prodOrConsumer);
                                    if (prodOrConsumer == "artists") { // known artist
                                        //choose random artist
                                        var randArtist = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random artist : ");
                                        //console.log(randArtist);
                                        // choose song of this one or similiar
                                        var artistOrSimiliar = pickArtistOrSimiliar();
                                        if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                            //console.log("getting song from picked artist: " + randArtist);
                                            var chsnSongArtist = getRandTrack(randArtist);
                                            //console.log("song choosen : ");
                                            //console.log(chsnSongArtist);
                                            playlist.push(chsnSongArtist);
                                        } else { // find similar artist
                                            //console.log("picking song of similiar artist");
                                            //console.log(randArtist.artistName);
                                            var artistSimiliar = getSimilarArtist(randArtist);
                                            //console.log("getting song of artist similar: ");
                                            //console.log(artistSimiliar);
                                            var chsnSongSimilar = getRandTrack(artistSimiliar.name);
                                            //console.log("song choosen : ");
                                            //console.log(chsnSongSimilar);
                                            playlist.push(chsnSongSimilar);
                                            }
                                            } else { // producer
                             
                                        var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        //console.log("choosen random producer : ");
                                        //console.log(randArtistProducer);

                                        var collection = db.collection('Users');
                                        collection.findOne({
                                            username: randArtistProducer
                                        }, function(err, document) {
                                            if (err) { //user not found
                                                throw err;
                                            } else {
                                                //console.log(document.userId); 
                                                collection = db.collection('Producer_songs_list');
                                                collection.findOne({
                                                    prodId: document.userId
                                                }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
                                                        //console.log(document.songs);
                                                        //console.log("picked rand song of producer: ");
                                                        //console.log(getRandTrackProducer(document.songs));
                                                        playlist.push(getRandTrackProducer(document.songs));


                                                    }
                                                });
                                            }
                                        });
                                    }
                                        
                                        
                                        
                                    }
                                } 
                            }
                        });


                }
                }
            });
        }
    });//console.log("this is second currGenre: " + this.currGenre);
}

//module.exports = playlist;
module.exports = playlist;
module.exports = nextSong;
