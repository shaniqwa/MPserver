var MongoClient = require('mongodb').MongoClient,
    format = require('util').format;
var Random = require('random-js');
var request = require('sync-request');
var graphInit = require('./graph');
var YouTube = require('youtube-node');




//variables 
var currGenre;
var user;
var mode;
var userGraph;
var playlist = [];
var uId;
var prevNG;
var ng;
//var flagFinish;
var runs = 0;
var engine = Random.engines.mt19937().autoSeed();
var youTube = new YouTube();

youTube.setKey('AIzaSyAj8gdaFuSOQ2nBnBh1ShUVRsuhxoWFsXk');
// constructor
function nextSong(currGenre, user, mode, userGraph, startGenre) {
    this.currGenre = currGenre;
    this.user = parseInt(user);
    this.mode = parseInt(mode);
    this.userGraph = userGraph;
    this.startGenre = startGenre;
    this.playlist = [];
    //this.flagFinish = 0;
    ng = currGenre;
}


nextSong.prototype.getPlaylistLength = function() {
    return playlist.length;
};

nextSong.prototype.getPlaylist = function() {
    return playlist;
};
nextSong.prototype.clearPlaylist = function() {
    playlist.length = 0;
    playlist = [];
};

// methods
nextSong.prototype.getNextSong = function(NScallback) {
    this.connectDB(this.currGenre, this.user, this.mode, this.userGraph, this.startGenre, function(err) {
        if (err) {
            NScallback(err);
        } else {
            NScallback();
        }
    });
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

var pushSong = function(song, typeAP, artistOrg,genre, callback) {

    var songFull = song.artist.name + " - " + song.name + " | " + song.artist.name + " | " + song.name;
    console.log("full song " + songFull);
    youTube.addParam('type', 'video');
    youTube.search(songFull, 2, function(error, result) {
        if (error) {
            console.log(error);
        } else { // no error
            if (result.items.length == 0) { // skip iter
                console.log("****search on youtube : 0 results, keep looping");
				var i = 0;
				var runsYT = 0;
				var finYT = 0;
                while (true) {
					while(runsYT != i) {
					if (finYT == 1) { return; }
					console.log("waiting for YT iter to finish");
					   
					   require('deasync').sleep(1000);
					}
					
                    var chsnSongNew = getRandTrack(artistOrg);
                    console.log("*new song: " + chsnSongNew)


                    var songFullNew = chsnSongNew.artist.name + " - " + chsnSongNew.name + " | " + chsnSongNew.artist.name + " | " + chsnSongNew.name;
                    console.log("full song " + songFullNew);
                    youTube.addParam('type', 'video');
                    youTube.search(songFullNew, 2, function(error, result) {
                        if (error) {
                            console.log(error);
                        } else { // no error
                            if (result.items.length == 0) { // skip iter
                                console.log("***again no results");
								runsYT++;

                            } else { // there are results from youtube
                                console.log("found url: https://www.youtube.com/watch?v=" + result.items[0].id.videoId);
                                playlist.push({
                                    artistName: chsnSongNew.artist.name,
                                    songName: chsnSongNew.name,
									currGenre: genre,
                                    url: "https://www.youtube.com/watch?v=" + result.items[0].id.videoId,
                                    type: typeAP
                                });
								finYT = 1;
                                callback();
                            }
                        }

                    });
				++i;



                } //endssssssss




            } else { // there are results from youtube
                console.log("found url: https://www.youtube.com/watch?v=" + result.items[0].id.videoId);
                playlist.push({
                    artistName: song.artist.name,
                    songName: song.name,
					currGenre: genre,
                    url: "https://www.youtube.com/watch?v=" + result.items[0].id.videoId,
                    type: typeAP
                });
                callback("ok");
            }
        }

    });


}

function pickProducerConsumer() { 
    var relations = [
        [20, "producers"],
        [80, "artists"]
    ];
    var result = pickChoice(relations);
    console.log("Producer or Artist: " + result);
    return result;
};

function pickArtistOrSimiliar() {
    var relations = [
        [10, "thisArtist"],
        [90, "similiar"]
    ];
    var result = pickChoice(relations);
    console.log("Artist or Similar: " + result);
    return result;
};



function getRandArtist(type, userObject, currGenre) {

    for (obj in userObject) {
        if (userObject[obj][type].length == 0) {
            return 476;
        } // todo: will return from findMatch id
        if (userObject[obj].genreName == currGenre) { // our genre
            var distribution = Random.integer(0, userObject[obj][type].length - 1);
            console.log("####################### " + userObject[obj][type][distribution(engine)]);
            return userObject[obj][type][distribution(engine)];
        }
    }
};


function getRandTrack(artist) { // todo validations
    if (typeof artist === 'object') {
        artist = artist.name;
    }
    console.log("getRandTrack: calling last fm...");
    var res = request('GET', 'http://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&autocorrect=1&limit=30&artist=' + encodeURIComponent(artist) + '&api_key=5b801a66d1a34e73b6e563afc27ef06b&format=json');
    var tracks = JSON.parse(res.getBody('utf8')).toptracks.track;
    var theSong = Random.pick(engine, tracks, 0, tracks.length);
    return theSong;
};

function getSimilarArtist(artist) {
    var res = request('GET', 'http://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&autocorrect=1&limit=30&artist=' + encodeURIComponent(artist) + '&api_key=5b801a66d1a34e73b6e563afc27ef06b&format=json');

    var artists = JSON.parse(res.getBody('utf8')).similarartists.artist;
    var theArtist = Random.pick(engine, artists, 0, artists.length);
    console.log("similar artist to " + artist + " is : " + theArtist.name);
    return theArtist;
};

function getRandTrackProducer(arrSongs,genre) {
    var theSong = Random.pick(engine, arrSongs.songs, 0, arrSongs.songs.length);
	theSong['type'] =  'producer';
	theSong['prodId'] = arrSongs.prodId;
	theSong['currGenre'] = genre;
    return theSong;
};

nextSong.prototype.connectDB = function(currGenre, user, mode, userGraph, startGenre, callback) {
    if ((runs != 0) && (typeof prevNG !== 'undefined')) {
        if (prevNG == false) {
            currGenre = ng;
        } else {
            currGenre = prevNG;
        }
    }
	
    runs = parseInt(runs) + 1;
    console.log("************************** currGenre is: " + currGenre + "  prevNG is: " +prevNG + "  ng is " + ng);
    MongoClient.connect('mongodb://52.35.9.144:27017/musicprofile', function(err, db) {
        if (err) {
            throw err;
        } else {
            console.log("[]successfully connected to the database");
            var collection = db.collection('Users');
            collection.findOne({
                userId: user
            }, function(err, document) {
                if (err) { //user not found
                    throw err;
                } else { //found user
                    if (mode == 1) { // pleasure, now extract all data of pie
                        uId = document.userId;
                        collection = db.collection('Pleasure_pie');
                        collection.findOne({
                            pleasurePieId: document.userId
                        }, function(err, document) {
                            if (err) { // didn't found pie data
                                throw err;
                            } else { //found pie data
                                var count = document.genres.length;
                                var results = [];
								var idCurrGenreArr = 0;
                                for (var i = 0; i < count; i++) {
                                    results.push([Math.floor(document.genres[i].percent), document.genres[i].genreName]);
									if(document.genres[i].genreName == currGenre) { idCurrGenreArr = i; } // store id of currgenre in array
                                }
                                var newGenre = pickChoice(results);
                                if ((currGenre == newGenre) || (runs == 1) ) { // if same genre or first run
                                    var prodOrConsumer = pickProducerConsumer();
                                    if ((prodOrConsumer == "artists") || (document.genres[idCurrGenreArr].producers.length == 0)) { // known artist
										prodOrConsumer = "artists";
                                        var randArtist = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        var artistOrSimiliar = pickArtistOrSimiliar();
                                        if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                            var chsnSongArtist = getRandTrack(randArtist);
										
                                            console.log("the track:: " + chsnSongArtist);
                                            pushSong(chsnSongArtist,"artist",randArtist,currGenre, function(stat) {
												if (stat == "no_url") {
												console.log("no url!!!!!");
											
												} else {
													callback()
													
												}
                                            });
										
											
                                        } else { // find similar artist
                                            var artistSimiliar = getSimilarArtist(randArtist);
											var chsnSongSimilar = getRandTrack(artistSimiliar);

											console.log("line 318 the track:: ");
                                            console.log(chsnSongSimilar);
                                            pushSong(chsnSongSimilar,"artist",artistSimiliar,currGenre, function(stat) {
												if (stat == "no_url") {
												console.log("no url!!!!!");
											
                                                //callback();
												} else {
													callback()
												}
                                                
                                            });
											
                                        }
                                    } else { // producer
                                        var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, currGenre);

                                        
                                                var collection = db.collection('Producer_songs_list');
                                                collection.findOne({
                                                    prodId: randArtistProducer
                                                }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
														if (document) { 
                                                        playlist.push(getRandTrackProducer(document,currGenre));
                                                        callback();
														} else {
														var noProd = { producer : "no"};
														playlist.push(noProd);
														callback();
														}
                                                    }
                                                });
                                            
                                        
                                    }
                                } else {
                                    console.log("**sending to nextgenre curr genre:" + currGenre + " startgenre: " + startGenre);
                                    var pickedGenre = userGraph.nextGenre(user, startGenre, currGenre);
                                    prevNG = pickedGenre;
                                    console.log("# the returned value is: " + pickedGenre);
                                    if (pickedGenre == false) { //switch genre and get song
                                        collection = db.collection('Pleasure_pie');
                                        collection.findOne({
                                            pleasurePieId: uId
                                        }, function(err, document) {
                                            if (err) { // didn't found pie data
                                                throw err;
                                            } else { //found pie data
                                                var count = document.genres.length;
                                                var results = [];
												var idCurrGenreArr = 0;
                                                for (var i = 0; i < count; i++) {
                                                    results.push([Math.floor(document.genres[i].percent), document.genres[i].genreName]);
													if(document.genres[i].genreName == currGenre) { idCurrGenreArr = i; } // store id of currgenre in array
                                                }
                                                var newGenre = pickChoice(results);
                                                ng = newGenre;
                                                //choose producer or known artist
                                                var prodOrConsumer = pickProducerConsumer();
                                                if ((prodOrConsumer == "artists") || (document.genres[idCurrGenreArr].producers.length == 0)) { // known artist
													prodOrConsumer = "artists";
                                                    //choose random artist
                                                    var randArtist = getRandArtist(prodOrConsumer, document.genres, newGenre);
                                                    var artistOrSimiliar = pickArtistOrSimiliar();
                                                    if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                                        var chsnSongArtist = getRandTrack(randArtist);
														console.log("line 387 the artist:: ");
                                                        console.log(chsnSongArtist);
														pushSong(chsnSongArtist,"artist",randArtist,newGenre, function(stat) {
														if (stat == "no_url") {
														console.log("no url!!!!!");
									
														//callback();
														} else {
															callback()
														}
																});
														

                                                    } else { // find similar artist
                                                        var artistSimiliar = getSimilarArtist(randArtist);
                                                        var chsnSongSimilar = getRandTrack(artistSimiliar);
													
															console.log("line 404 the artist:: ");
                                                            console.log(chsnSongSimilar);
															 pushSong(chsnSongSimilar,"artist",artistSimiliar,newGenre, function(stat) {
															if (stat == "no_url") {
															console.log("no url!!!!!");
										
															//callback();
															} else {
																callback()
															}
																	});
																	
												
                                                      
															}
                                                } else { // producer

                                                    var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, newGenre);
                                                    var collection = db.collection('Producer_songs_list');
                                                    

                                                            collection.findOne({
                                                                prodId: randArtistProducer
                                                            }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
														if (document) { 
                                                        playlist.push(getRandTrackProducer(document,newGenre));
                                                        callback();
														} else {
														var noProd = { producer : "no"};
														playlist.push(noProd);
														callback();
														}
                                                    }
                                                            });
                                                        
                                                    
                                                } // ends producer


                                            }
                                        });




                                    } else { // get song of returned genre
                                        //choose producer or known artist
                                        var prodOrConsumer = pickProducerConsumer();
                                        if (prodOrConsumer == "artists") { // known artist
                                            //choose random artist
                                            var randArtist = getRandArtist(prodOrConsumer, document.genres, pickedGenre);
                                            // choose song of this one or similiar
                                            var artistOrSimiliar = pickArtistOrSimiliar();
                                            if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                                var chsnSongArtist = getRandTrack(randArtist);

												pushSong(chsnSongArtist,"artist",randArtist,pickedGenre, function(stat) {
                                                if (stat == "no_url") {
												console.log("no url!!!!!");
					
                                                //callback();
												} else {
													callback()
												}
                                                });
												
									
                                            } else { // find similar artist
                                                var artistSimiliar = getSimilarArtist(randArtist);
                                                var chsnSongSimilar = getRandTrack(artistSimiliar);
											
												pushSong(chsnSongSimilar,"artist",artistSimiliar,pickedGenre, function(stat) {
                                                if (stat == "no_url") {
												console.log("no url!!!!!");
								
                                                //callback();
												} else {
													callback()
												}
                                                });


                                            }
                                        } else { // producer

                                            var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, pickedGenre);
                                            var collection = db.collection('Producer_songs_list');
                                            
                                                    
                                                    collection.findOne({
                                                        prodId: randArtistProducer //stas : was a conflict between user name which doesnt exists..
                                                    }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
														if (document) { 
                                                        playlist.push(getRandTrackProducer(document,pickedGenre));
                                                        callback();
														} else {
														var noProd = { producer : "no"};
														playlist.push(noProd);
														callback();
														}
                                                    }
                                                    });
                                                
                                         
                                        } //end producer



                                    }
                                }
                            }
                        });

                    } else { //business, now extract all data of pie 
                        uId = document.userId;
                        collection = db.collection('Business_pie');
                        collection.findOne({
                            businessPieId: uId
                        }, function(err, document) {
                            if (err) { // didn't found pie data
                                throw err;
                            } else { //found pie data
                                console.log("extracting pie data :");
                                var count = document.genres.length;
                                var results = [];
								var idCurrGenreArr = 0;
                                for (var i = 0; i < count; i++) {
                                    results.push([Math.floor(document.genres[i].percent), document.genres[i].genreName]);
									if(document.genres[i].genreName == currGenre) { idCurrGenreArr = i; } // store id of currgenre in array
                                }
                                var newGenre = pickChoice(results);
                                ng = newGenre;
                                if ((currGenre == newGenre) || (runs == 1)) { //stay in same genre or first run
                                    var prodOrConsumer = pickProducerConsumer();
                                    if ((prodOrConsumer == "artists") || (document.genres[idCurrGenreArr].producers.length == 0)) { // known artist
										prodOrConsumer = "artists";
                                        var randArtist = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        var artistOrSimiliar = pickArtistOrSimiliar(); // choose song of this one or similiar
                                        if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                            var chsnSongArtist = getRandTrack(randArtist);

												pushSong(chsnSongArtist,"artist",randArtist,currGenre, function(stat) {
                                                if (stat == "no_url") {
												console.log("no url!!!!!");
									
                                                //callback();
												} else {
													callback()
												}
                                            });
											
										
                                        } else { // find similar artist
                                            var artistSimiliar = getSimilarArtist(randArtist);
                                            var chsnSongSimilar = getRandTrack(artistSimiliar);
				
                                            pushSong(chsnSongSimilar,"artist",artistSimiliar,currGenre, function(stat) {
                                                if (stat == "no_url") {
												console.log("no url!!!!!");
									
                                                //callback();
												} else {
													callback()
												}
                                            });
											
                                        }
                                    } else { // producer
                                        var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, currGenre);
                                        var collection = db.collection('Producer_songs_list');
                                        
                                                
                                                collection.findOne({
                                                    prodId: randArtistProducer
                                                }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
														if (document) { 
                                                        playlist.push(getRandTrackProducer(document,currGenre));
                                                        callback();
														} else {
														var noProd = { producer : "no"};
														playlist.push(noProd);
														callback();
														}
                                                    }
                                                });

                                            
                                        
                                    } //ends producer
                                } else {
                                    console.log("**sending to nextgenre curr genre:" + currGenre + " startgenre: " + startGenre);
                                    var pickedGenre = userGraph.nextGenre(user, startGenre, currGenre);
                                    prevNG = pickedGenre;
                                    if (pickedGenre == false) { //switch genre and get song
                                        collection = db.collection('Business_pie');
                                        collection.findOne({
                                            businessPieId: uId
                                        }, function(err, document) {
                                            if (err) { // didn't found pie data
                                                throw err;
                                            } else { //found pie data
                                                var count = document.genres.length;
                                                var results = [];
												var idCurrGenreArr = 0;
                                                for (var i = 0; i < count; i++) {
                                                    results.push([Math.floor(document.genres[i].percent), document.genres[i].genreName]);
													if(document.genres[i].genreName == currGenre) { idCurrGenreArr = i; } // store id of currgenre in array
                                                }
                                                var newGenre = pickChoice(results);
                                                ng = newGenre;
                                                //choose producer or known artist
                                                var prodOrConsumer = pickProducerConsumer();
                                                if ((prodOrConsumer == "artists") || (document.genres[idCurrGenreArr].producers.length == 0)) { // known artist
													prodOrConsumer = "artists";
                                                    //choose random artist
                                                    var randArtist = getRandArtist(prodOrConsumer, document.genres, newGenre); // choose song of this one or similiar
                                                    var artistOrSimiliar = pickArtistOrSimiliar();
                                                    if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                                        var chsnSongArtist  = getRandTrack(randArtist);
								
														pushSong(chsnSongArtist,"artist",randArtist,newGenre, function(stat) {
                                                        if (stat == "no_url") {
														console.log("no url!!!!!");
												
														//callback();
														} else {
														callback()
														}
                                                        });
														
													
                                                    } else { // find similar artist
                                                        var artistSimiliar = getSimilarArtist(randArtist);
														artistSimiliar = artistSimiliar.name;
                                                        var chsnSongSimilar = getRandTrack(artistSimiliar);

														pushSong(chsnSongSimilar,"artist",artistSimiliar,newGenre, function(stat) {
														if (stat == "no_url") {
														console.log("no url!!!!!");
												
														//callback();
														} else {
															callback()
														}
                                                        });
														
													
                                                    }
                                                } else { // producer

                                                    var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, newGenre);
                                                    var collection = db.collection('Producer_songs_list');
                                                            collection.findOne({
                                                                prodId: randArtistProducer
                                                            }, function(err, document) {
                                                                                                                   if (err) { //user not found
                                                        throw err;
                                                    } else {
														if (document) { 
                                                        playlist.push(getRandTrackProducer(document,newGenre));
                                                        callback();
														} else {
														var noProd = { producer : "no"};
														playlist.push(noProd);
														callback();
														}
                                                    }
                                                            });
                                                        
                                                    
                                                } //ends producer


                                            }
                                        });




                                    } else { // get song of returned genre
                                        //choose producer or known artist
                                        var prodOrConsumer = pickProducerConsumer();
                                        if (prodOrConsumer == "artists") { // known artist
                                            //choose random artist
                                            var randArtist = getRandArtist(prodOrConsumer, document.genres, pickedGenre); // choose song of this one or similiar
                                            var artistOrSimiliar = pickArtistOrSimiliar();
                                            if (artistOrSimiliar == "thisArtist") { // find song of this artist 
                                                var chsnSongArtist = getRandTrack(randArtist);
											

												pushSong(chsnSongArtist,"artist",randArtist,pickedGenre, function(stat) {
                                                if (stat == "no_url") {
												console.log("no url!!!!!");
										
                                                //callback();
												} else {
													callback()
												}
                                                });
												
												
                                            } else { // find similar artist
                                                var artistSimiliar = getSimilarArtist(randArtist);
												artistSimiliar = artistSimiliar.name;
                                                var chsnSongSimilar = getRandTrack(artistSimiliar);

												pushSong(chsnSongSimilar,"artist",artistSimiliar,pickedGenre, function(stat) {
                                                if (stat == "no_url") {
												console.log("no url!!!!!");

                                                //callback();
												} else {
													callback()
												}
                                                });		
												
                                            }
                                        } else { // producer
                                            var randArtistProducer = getRandArtist(prodOrConsumer, document.genres, pickedGenre);
                                            var collection = db.collection('Producer_songs_list');
                                            
                                                    // console.log(document.userId); 
                                                    
                                                    collection.findOne({
                                                        prodId: randArtistProducer
                                                    }, function(err, document) {
                                                    if (err) { //user not found
                                                        throw err;
                                                    } else {
														if (document) { 
                                                        playlist.push(getRandTrackProducer(document,pickedGenre));
                                                        callback();
														} else {
														var noProd = { producer : "no"};
														playlist.push(noProd);
														callback();
														}
                                                    }
                                                    });
                                                
                                           
                                        } //ends producer



                                    }
                                }
                            }
                        });


                    }
                }
            });
        }
    });
}

module.exports = playlist;
module.exports = nextSong;