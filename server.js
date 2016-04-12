var express = require('express'),
	app = express(),
	Controller = require('./Controller'),
    ProducerController = require('./ProducerController'),
    DJ = require('./dj');

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
        console.log(data);
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
    // LOGIN ===============================
    // =====================================
    // show the login form
    // app.get('/login', function(req, res) {
    //     // render the page and pass in any flash data if it exists
    //     res.render('login.ejs', { message: req.flash('loginMessage') }); 
    // });

    // // process the login form
    // app.post('/login', passport.authenticate('local-login', {
    //     successRedirect : '/profile', // redirect to the secure profile section
    //     failureRedirect : '/login', // redirect back to the signup page if there is an error
    //     failureFlash : true // allow flash messages
    // }));

    // // =====================================
    // // SIGNUP ==============================
    // // =====================================
    // // show the signup form
    // app.get('/signup', function(req, res) {

    //     // render the page and pass in any flash data if it exists
    //     res.render('signup.ejs', { message: req.flash('signupMessage') });
    // });

    // // process the signup form
    // app.post('/signup', passport.authenticate('local-signup', {
    //     successRedirect : '/profile', // redirect to the secure profile section
    //     failureRedirect : '/signup', // redirect back to the signup page if there is an error
    //     failureFlash : true // allow flash messages
    // }));

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
                console.log(pleasure);
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

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        // app.get('/connect/local', function(req, res) {
        //     res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        // });
        // app.post('/connect/local', passport.authenticate('local-signup', {
        //     successRedirect : '/profile', // redirect to the secure profile section
        //     failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        //     failureFlash : true // allow flash messages
        // }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : ['email','user_actions.music', 'user_likes'] }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email', 'https://www.googleapis.com/auth/youtube' , 'https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtubepartner'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    // app.get('/unlink/local', function(req, res) {
    //     var user            = req.user;
    //     user.email    = undefined;
    //     user.password = undefined;
    //     user.save(function(err) {
    //         res.redirect('/profile');
    //     });
    // });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
        var user = req.user;
        user.FB_AT = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user = req.user;
        user.YT_AT = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email', 'https://www.googleapis.com/auth/youtube' , 'https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtubepartner'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                   failureRedirect : '/'
            }),function(req, res){
                console.log(req.user.is_New);
                if (req.user.is_New) { return res.redirect('/BPwizard'); }
                res.redirect('/profile');
            });



    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email','user_actions.music', 'user_likes'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect : '/'
        }),function(req, res){
            console.log(req.user.is_New);
            if (req.user.is_New) { return res.redirect('/BPwizard'); }
            res.redirect('/profile');
        });


	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}

	//Business Pleasure Wizard - a step in registration
	app.get('/BPwizard', function (req, res){
        console.log("user id: " +req.user.userId);
            res.render('BPwizard.ejs', {
                userID : req.user.userId
            });
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
		console.log("\nRequest to delete user with userID: " + value);
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
    // getProducerSongs
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
       //updateCounters
     app.param('songID', function ( req, res, next, value){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
     });
    // updateCounters
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
     //***********************************************************************//
     //**************************ProducerController  END**********************//
     //***********************************************************************//


    //process Wizard Form
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


//===============PORT=================
	server.listen(process.env.PORT || 3000);
	console.log("The magic happens on port 3000");

