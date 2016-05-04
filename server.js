var express = require('express'),
	app = express(),
	Controller = require('./Controller'),
    ControllerB = require('./ControllerB'),
    ProducerController = require('./ProducerController'),
    DJ = require('./dj');

var request = require('request');
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

var mongoose = require('mongoose');

var configDB = require('./config/database.js');
mongoose.createConnection(configDB.url); // connect to our database

var bodyParser = require('body-parser');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var async = require("async");




    //===============SCHEMAS================
var businessPieSchema = require("./schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');

	//===============EXPRESS================
	require('./config/passport')(passport);
	app.use(morgan('dev')); // log every request to the console
	app.use(cookieParser()); // read cookies (needed for auth)
	app.set('view engine', 'ejs'); // set up ejs for templating
	app.use(bodyParser.urlencoded({
  		extended: true
	}));
	app.use(bodyParser.json()); // support json encoded bodies
	// required for passport
	app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session
		
	app.use('/', express.static('./views'));


    //===============SOCKET.IO EVENTS===============

io.on('connection', function(client) {  
    console.log('Client connected...');

    client.on('join', function(data) {
        // console.log(data);
         // client.emit('messages', 'Hello from server');
    });

    client.on('messages', function(data) {
           client.emit('broad', data);
           client.broadcast.emit('broad',data);
    });

});





	//===============ROUTES===============



	// =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });



    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
    	var business, pleasure;

 		async.waterfall([
        //find user's pies
        function(callback) {
            //create user
            BusinessPie.findOne({ 'businessPieId' :  req.user.userId }, function(err, businessPie) {
	            // if there are any errors, return the error
	            if (err){
	                return console.log(err);
	            }
	            business = businessPie;
	            callback();
	        });
        },
        function(callback) {
            //create user
            PleasurePie.findOne({ 'pleasurePieId' :  req.user.userId }, function(err, pleasurePie) {
                // if there are any errors, return the error
                if (err){
                    return console.log(err);
                }
                pleasure = pleasurePie;
                callback();
            });
        }
        ], function(err) {
            if (err) {
                throw err;
            }
            console.log('all done');
				res.render('profile.ejs', {
	            user : req.user, // get the user out of session and pass to template
	            business: business,
	            pleasure: pleasure
	        });
        });        
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });






    // =====================================
    // LOGIN/SIGNUP ========================
    // =====================================


    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails

    // 'https://www.googleapis.com/auth/youtube'
    app.get('/auth/google', function(req, res){
        console.log("auth with google, user type: " + req.query.type);
        passport.authenticate(
            'google', 
            { 
                scope : [
                            'profile', 
                            'email' , 
                            'https://www.googleapis.com/auth/youtube.readonly', 
                            'https://www.googleapis.com/auth/youtubepartner'
                        ],
                state: req.query.type
                })(req,res);
        });





    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                   failureRedirect : '/'
            }),function(req, res){
                if (req.user.is_New && req.user.typeOfUser == "Consumer"){ 
                    return res.redirect('/BPwizard'); 
                }
                if (req.user.is_New && req.user.typeOfUser == "Producer"){ 
                    return res.redirect('/ProducerWizard'); 
                }
                res.redirect('/profile');
            });



    // connect google ---------------------------------
    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email', 'https://www.googleapis.com/auth/youtube' , 'https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtubepartner'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));


    // unlink google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user = req.user;
        user.YT_AT = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });






    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', function(req, res){
        console.log("auth with facebook, user type: " + req.query.type);
        passport.authenticate(
            'facebook', 
            { scope :   [
                            'email',
                            'user_actions.music', 
                            'user_likes',
                            'user_birthday',
                            'user_location'
                        ],
              state: req.query.type
            })(req,res);
        });

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect : '/'
        }),function(req, res){
            if (req.user.is_New && req.user.typeOfUser == "Consumer"){ 
                return res.redirect('/BPwizard'); 
            }
            if (req.user.is_New && req.user.typeOfUser == "Producer"){ 
                return res.redirect('/ProducerWizard'); 
            }
            res.redirect('/profile');
        });





    // connect facebook -------------------------------
    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope : ['email','user_actions.music', 'user_likes','user_location'] }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));



    // unlink facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user = req.user;
        user.FB_AT = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}





    // =====================================
    // WIZARDS ========================
    // =====================================

	//Business Pleasure Wizard - a step in registration
	app.get('/BPwizard', function (req, res){
        // console.log("user id: " +req.user.userId);
            res.render('BPwizard.ejs', {
                user : req.user
            });
	});




    //process BPWizard Form
    app.post('/processWizardForm', function (req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        app.set('json spaces', 4);
        res.set("Content-Type", "application/json");
        res.status(200);

        var data = {};
        data = req.body;
        Controller.processWizardForm(req,res,data);
    });





    //Producer Wizard - a step in Producer registration
    app.get('/ProducerWizard', function (req, res){
        var list = [];
        async.series([
            function(callback){
                request("https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&key=AIzaSyCFLDEh1SbsSvQcgEVHuMOGfKefK8Ko-xc&access_token="+req.user.YT_AT, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var temp = JSON.parse(body);
                        for(i=0; i<temp.items.length; i++){
                            list.push({title: temp.items[i].snippet.title, id: temp.items[i].id});
                        }
                        console.log("the list:");
                        console.log(list);
                        callback(null, 'list is full'); 
                    }
                });
            }
            // ,
            // function(callback){
            //     // do some more stuff ...
            //     callback(null, 'two');
            // }
        ],
        // optional callback
        function(err, results){
            // all done
             res.render('ProducerWizard.ejs', {
                user : req.user,
                list: list
            });
        });
            // var list = [];
            // list = Controller.getProducerPlaylists(req.user.YT_AT);
            // console.log(list);
    });

    //***********************************************************************//
    //*******************************User Funcs******************************//
    //***********************************************************************//


    //Get User's Favorites list
    // getFavorites/:userID
    app.param('userID', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    //route that recives parameter using defined parameters
    app.get('/getFavorites/:userID', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
        Controller.getFavorites(res,req.params.userID);
    });






    //Add Song to Favorites
    app.post('/addToFavorites', function (req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        app.set('json spaces', 4);
        res.set("Content-Type", "application/json");
        res.status(200);

        var data = {};
        data = req.body;
        Controller.addToFavorites(res,data);
    });





        //Remove Song from favorites
    app.post('/removeFav', function (req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        app.set('json spaces', 4);
        res.set("Content-Type", "application/json");
        res.status(200);

        var data = {};
        data = req.body;
        ControllerB.removeFav(res,data);
    });

     //Add follower to followers
    app.post('/addToFollowers', function (req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        app.set('json spaces', 4);
        res.set("Content-Type", "application/json");
        res.status(200);

        var data = {};
        data = req.body;
        ControllerB.addToFollowers(res,data);
    });






	//Add Song to Blacklist
	app.post('/addToBlackList', function (req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		app.set('json spaces', 4);
		res.set("Content-Type", "application/json");
		res.status(200);

		var data = {};
		data = req.body;
		Controller.addToBlackList(res,data);
	});








	//Delete User
	app.param('userID', function ( req, res, next, value){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	//route that recives parameter using defined parameters
	app.get('/deleteUser/:userID', 
		function (req, res, next){
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next(); 
		},

		function (req, res) {
		Controller.deleteUser(res,req.params.userID);
	});










    //Find match
    app.param('userIDM', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    //route that recives parameter using defined parameters
    app.get('/findMatch/:userIDM', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
        ControllerB.findMatch(res,req.params.userIDM);
    });










      //Search User
    app.param('username', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        console.log("\n username: " + value);
        next();
    });

    //route that recives parameter using defined parameters
    app.get('/searchuser/:username', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
        ControllerB.searchuser(res,req.params.username);
    });       









    //Get list of recommandation (producers that match the consumer)
    app.param('userIDR', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        console.log("\n userID: " + value);
        next();
    });

    //route that recives parameter using defined parameters
    app.get('/recommandation/:userIDR', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
        ControllerB.recommandation(res,req.params.userIDR);
    });       




    //***********************************************************************//
    //*****************************Playlist**********************************//
    //***********************************************************************//



    //Get Playlist
    app.param('uid', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.param('mode', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.param('limit', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

     app.param('genre', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    //route that recives parameter using defined parameters
    app.get('/getPlaylist/:uid/:mode/:limit/:genre', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
        	console.log("request for playlist with user id " +req.params.uid + " on mode " +req.params.mode + " list length " +req.params.limit + " genre: " + req.params.genre);
        DJ.getUserPlaylist(res,req.params.uid,req.params.mode,req.params.limit, req.params.genre);
    });


    //***********************************************************************//
    //**************************ProducerController***************************//
    //***********************************************************************//

    //getProducerStatistics
     app.param('prodID', function ( req, res, next, value){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    //route that recives parameter using defined parameters
    app.get('/getProducerStatistics/:prodID', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
            console.log("request for getProducerStatistics with user id " +req.params.prodID);
            ProducerController.getProducerStatistics(res,req.params.prodID);
    });








     //getProducerSongs
     app.param('prodID', function ( req, res, next, value){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
     });

     app.get('/getProducerSongs/:prodID', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
            console.log("request for getProducerStatistics with user id " +req.params.prodID);
            ProducerController.getProducerSongs(res,req.params.prodID);
    });









      //updateCounters
     app.param('prodID', function ( req, res, next, value){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
     });

     app.param('songID', function ( req, res, next, value){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
     });

     app.get('/updateCounters/:prodID/:songID', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
            console.log("request for updateCounters with user id " +req.params.prodID + " song id " + req.params.songID);
            ProducerController.updateCounters(res,req.params.prodID, req.params.songID);
    });


      
      //getFacebookYoutubeStatistics
       app.param('prodID', function ( req, res, next, value){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
       });

       app.get('/getFacebookYoutubeStatistics/:prodID', 
            function (req, res, next){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next(); 
            },

            function (req, res) {
                console.log("getFacebookYoutubeStatistics with id: " + req.params.prodID);
                ProducerController.getFacebookYoutubeStatistics(res,req.params.prodID);
       });




//===============PORT=================
	server.listen(process.env.PORT || 3000);
	console.log("The magic happens on port 3000");

