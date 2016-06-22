var express = require('express'),
	app = express(),
	Controller = require('./Controller'),
    ControllerB = require('./ControllerB'),
    ProducerController = require('./ProducerController'),
    DJ = require('./dj');

var request = require('request');
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://s.almog88%40gmail.com:shani101288@smtp.gmail.com');

var mongoose = require('mongoose');

var configDB = require('./config/database.js');
var signup = require('./controllers/signup.js');
mongoose.createConnection(configDB.url); // connect to our database

var bodyParser = require('body-parser');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var async = require("async");




    //===============MODELS===============
var usersSchema = require("./schemas/scheme_users.js").usersSchema; 
var User = mongoose.model('User', usersSchema, 'Users');

var businessPieSchema = require("./schemas/scheme_businessPie.js").businessPieSchema; 
var BusinessPie = mongoose.model('Business_pie', businessPieSchema, 'Business_pie');

var pleasurePieSchema = require("./schemas/scheme_pleasurePie.js").pleasurePieSchema; 
var PleasurePie = mongoose.model('Pleasure_pie', pleasurePieSchema, 'Pleasure_pie');

var artistPieSchema = require("./schemas/scheme_artistPie.js").artistPieSchema; 
var ArtistPie = mongoose.model('Artist_pie', artistPieSchema, 'Artist_pie');

var genresSchema = require('./schemas/scheme_genres.js').genresSchema;
var GenreS = mongoose.model('actionM', genresSchema);

var producerSongsSchema = require("./schemas/scheme_producerSongs.js").producerSongsSchema; 
var ProducerSongs = mongoose.model('Producer_songs_list', producerSongsSchema, 'Producer_songs_list');



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

    // Add headers
    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    });


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
    	var business, 
            pleasure, 
            songs,
            artistPie;

 		async.waterfall([
        //find user's pies
        function(callback) {
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
            PleasurePie.findOne({ 'pleasurePieId' :  req.user.userId }, function(err, pleasurePie) {
                // if there are any errors, return the error
                if (err){
                    return console.log(err);
                }
                pleasure = pleasurePie;
                callback();
            });
        },
        function(callback) {
            //if Producer - load also ProducerSongs and ArtistPie
            if(req.user.typeOfUser == "Producer"){
                ProducerSongs.findOne({ 'prodId' :  req.user.userId }, function(err, doc) {
                    if (err){
                        return console.log(err);
                    }
                    // console.log("doc:");
                    // console.log(doc);
                    
                    songs = doc.songs;
                    // console.log("songs:");
                    // console.log(songs);

                    ArtistPie.findOne({ 'artistPieId' :  req.user.userId }, function(err, doc) {
                        // if there are any errors, return the error
                        if (err){
                            return console.log(err);
                        }
                        artistPie = doc;
                        callback();
                    });
                });    
            }else{
                callback();
            }
            
        },
        function(callback){
            //call findMatch each time a user is looging in to find new recommandations
            // ControllerB.findMatch( req.user.userId , function(){
            //     console.log("findMatch finished");
            //     callback();
            // });
            callback();
        }
        ], function(err) {
            if (err) {
                throw err;
            }
            console.log('all done');
              if(req.user.typeOfUser == "Consumer"){
    				res.render('profile.ejs', {
    	            user : req.user, // get the user out of session and pass to template
    	            business: business,
    	            pleasure: pleasure
    	        });
            }else{
                res.render('profile.ejs', {
                    user : req.user, // get the user out of session and pass to template
                    business: business,
                    pleasure: pleasure,
                    songs: songs,
                    artist: artistPie
                });                
            }
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
        console.log("/auth/google: auth with google, user type: " + req.query.type);
        //different permissions for Producer and Consumer
        if(req.query.type == "Producer"){
           passport.authenticate(
                'google', 
                { 
                    scope : [
                                'profile', 
                                'email' , 
                                'https://www.googleapis.com/auth/youtube.readonly', 
                                'https://www.googleapis.com/auth/youtubepartner',
                                'https://www.googleapis.com/auth/youtube.force-ssl',
                                'https://www.googleapis.com/auth/youtube.upload',
                                'https://www.googleapis.com/auth/youtubepartner-channel-audit'
                            ],
                    accessType: 'offline', 
                    approvalPrompt: 'force',
                    state: req.query.type
                })(req,res);

        }else if(req.query.type == "Consumer"){
            passport.authenticate(
            'google', 
            { 
                scope : [
                            'profile', 
                            'email' , 
                            'https://www.googleapis.com/auth/youtube.readonly', 
                            'https://www.googleapis.com/auth/youtubepartner'
                        ],
                accessType: 'offline', 
                approvalPrompt: 'force',
                state: req.query.type
            })(req,res);
        }
 
    });





    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                   failureRedirect : '/'
            }),function(req, res){
                if (req.user.is_New && req.user.typeOfUser == "Consumer"){ 
                    console.log("auth with google, reg as consumer");
                    Controller.createMP(req,res);
                }
                else if (req.user.is_New && req.user.typeOfUser == "Producer"){ 
                    console.log("auth with google, reg as producer");
                    return res.redirect('/ProducerWizard'); 
                }else{
                    res.redirect('/profile');    
                }
                
    });



    // connect google ---------------------------------
    // send to google to do the authentication
    app.get('/connect/google', function(req, res){
        passport.authorize('google', { 
            scope : [
                        'profile', 
                        'email' , 
                        'https://www.googleapis.com/auth/youtube.readonly', 
                        'https://www.googleapis.com/auth/youtubepartner'
                    ]
        })(req,res);
    });

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
            'facebook', { 
                scope :   [
                            'email',
                            'user_actions.music', 
                            'user_likes',
                            'user_birthday',
                            'user_location',
                            'user_friends'
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
                // return res.redirect('/BPwizard'); 
                Controller.createMP(req,res);
            }
            else if (req.user.is_New && req.user.typeOfUser == "Producer"){ 
                return res.redirect('/ProducerWizard'); 
            }else{
                res.redirect('/profile');    
            }
            
        });





    // connect facebook -------------------------------
    // send to facebook to do the authentication
    app.get('/connect/facebook', function(req, res){
        passport.authorize('facebook',  { 
            scope : [
                        'email',
                        'user_actions.music', 
                        'user_likes',
                        'user_location',
                        'user_friends'
                    ]
        })(req,res);
    });

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
    // MOBILE ROUTES =======================
    // =====================================
        app.get('/Mobile', function(req, res) {
        var user,
            business, 
            pleasure, 
            songs,
            artistPie;

        async.waterfall([
        //find user
        function(callback) {
            User.findOne({ 'userId' :  req.query.userId }, function(err, doc) {
                // if there are any errors, return the error
                if (err){
                    return console.log(err);
                }
                user = doc;
                //check if user is_new == 0 

                
                callback();
            });
        },
        //find user's pies
        function(callback) {
            BusinessPie.findOne({ 'businessPieId' :  req.query.userId }, function(err, businessPie) {
                // if there are any errors, return the error
                if (err){
                    return console.log(err);
                }
                business = businessPie;
                callback();
            });
        },
        function(callback) {
            PleasurePie.findOne({ 'pleasurePieId' :  req.query.userId }, function(err, pleasurePie) {
                // if there are any errors, return the error
                if (err){
                    return console.log(err);
                }
                pleasure = pleasurePie;
                callback();
            });
        },
        function(callback) {
            //if Producer - load also ProducerSongs and ArtistPie
            if(req.query.typeOfUser == "Producer"){
                ProducerSongs.findOne({ 'prodId' :  req.query.userId }, function(err, doc) {
                    if (err){
                        return console.log(err);
                    }
                    
                    songs = doc.songs;

                    ArtistPie.findOne({ 'artistPieId' :  req.query.userId }, function(err, doc) {
                        // if there are any errors, return the error
                        if (err){
                            return console.log(err);
                        }
                        artistPie = doc;
                        callback();
                    });
                });    
            }else{
                callback();
            }
            
        },
        function(callback){
            //call findMatch each time a user is looging in to find new recommandations
            // ControllerB.findMatch( req.query.userId , function(){
            //     console.log("findMatch finished");
            //     callback();
            // });
             callback();
        }
        ], function(err) {
            if (err) {
                throw err;
            }
            console.log('all done');
              if(req.query.typeOfUser == "Consumer"){
                    res.render('profile.ejs', {
                    user : user, // get the user out of session and pass to template
                    business: business,
                    pleasure: pleasure
                });
            }else{
                res.render('profile.ejs', {
                    user : user, // get the user out of session and pass to template
                    business: business,
                    pleasure: pleasure,
                    songs: songs,
                    artist: artistPie
                });                
            }
        });        
    });



    // =====================================
    // Get Other User's Profile Page =======
    // =====================================
    app.param('userID', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });




    app.get('/getUser/:userID', function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            app.set('json spaces', 4);
            res.set("Content-Type", "application/json");
            next(); 
        },

        function (req, res) {
        var user,
            business, 
            pleasure, 
            songs,
            artistPie;

        async.waterfall([
        //find user's pies
        function(callback) {
            User.findOne({ 'userId' :  req.params.userID }, function(err, doc) {
                // if there are any errors, return the error
                if (err){
                    return console.log(err);
                }
                // console.log("user "+ doc.userId+ " found");
                if(doc){
                    user = doc;    
                    callback();
                }else{
                    console.log("getUser: cannot find user");
                }
                
                
            });
        },
        function(callback) {
            BusinessPie.findOne({ 'businessPieId' :  req.params.userID }, function(err, businessPie) {
                // if there are any errors, return the error
                if (err){
                    return console.log(err);
                }
                business = businessPie;
                callback();
            });
        },
        function(callback) {
            PleasurePie.findOne({ 'pleasurePieId' :  req.params.userID }, function(err, pleasurePie) {
                // if there are any errors, return the error
                if (err){
                    return console.log(err);
                }
                pleasure = pleasurePie;
                callback();
            });
        },
        function(callback) {
            // console.log(user);
            //if Producer - load also ProducerSongs and ArtistPie
            if(user.typeOfUser == "Producer"){
                ProducerSongs.findOne({ 'prodId' :  req.params.userID }, function(err, doc) {
                    if (err){
                        return console.log(err);
                    }
                    // console.log("doc:");
                    // console.log(doc);
                    if(doc){
                        songs = doc.songs;    
                    }
                    
                    // console.log("songs:");
                    // console.log(songs);

                    ArtistPie.findOne({ 'artistPieId' :  req.params.userID }, function(err, doc) {
                        // if there are any errors, return the error
                        if (err){
                            return console.log(err);
                        }
                        artistPie = doc;
                        callback();
                    });
                });    
            }else{
                callback();
            }
            
        }
        ], function(err) {
            if (err) {
                throw err;
            }
            console.log('user' + user.userId + 'has been loaded');
            //return json with user's info
            var response = {};
            response.user = user;
            response.business = business;
            response.pleasure = pleasure;
            
              if(user.typeOfUser == "Consumer"){
                res.status(200).json(response);
            }else{
                response.songs = songs;
                response.artist = artistPie;
                res.status(200).json(response);          
            }
        });        
    });







    // PRIVACY POLICY
        app.get('/privacyPolicy', function(req, res) {
           res.render('privacyPolicy.ejs');
    });




    // =====================================
    // WIZARDS ========================
    // =====================================

	//Business Pleasure Wizard - a step in registration
	// app.get('/BPwizard', isLoggedIn, function (req, res){
 //        // console.log("user id: " +req.user.userId);
 //            res.render('BPwizard.ejs', {
 //                user : req.user
 //            });
	// });




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





        //process Producer Wizard Form 
    app.post('/processProducerWizardForm', isLoggedIn, function (req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        app.set('json spaces', 4);
        res.set("Content-Type", "application/json");
        res.status(200);

        var data = {};
        data = req.body;
        Controller.processProducerWizardForm(req,res,data);
    });



    //process update preferences Form
    app.post('/updatePreferences', function (req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        app.set('json spaces', 4);
        res.set("Content-Type", "application/json");
        res.status(200);

        var data = {};
        data = req.body;
        Controller.updatePreferences(req,res,data);
    });

    //mobile connection
    app.post('/enterfromMobile', function (req, res){
        console.log("inside server");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        app.set('json spaces', 4);
        res.set("Content-Type", "application/json");
        res.status(200);

       
         var data = {};
        data = req.body;


       
       data.user = JSON.parse(data.user);
       console.log(data);
       var searchKey, 
       searchId = data.user.id;
       console.log(data.user.id);
       if (data.platform == "facebook"){
         var key = 'FB_id';
            var query = {};
            query[key] = searchId;

        console.log("face succes");
        // try to find the user based on their facebook id
         User.findOne(query, function(err, doc) {
                if (err){
                    console.log(err);
                    res.json("error");
                }
                if (doc) {
                    // if a user is found, log them in
                    console.log(doc);
                     res.json(doc.userId);
                } else {
                    // if the user isnt in our database, create a new user
                    signup.registerNewUserFromMobile(data.platform, data.type, data.user, data.token, "refreshToken",  function(err,newUser){
                        if(err){
                            console.log(err);
                            res.json("error");
                        }else{
                            req.user = newUser;
                            console.log(newUser);
                            req.mobile = true;
                            Controller.createMP(req,res);
                            //return id to app
                            // res.json(newUser.userId);
                        }

                    });
                }
            });
        
       }else if(data.platform == "google"){
            console.log("google succes");
            var key = 'YT_id';
            var query = {};
            query[key] = searchId;

            // try to find the user based on their google id
             User.findOne(query, function(err, doc) {
                if (err){
                    console.log(err);
                    res.json(err);
                }
                if (doc) {
                    // if a user is found, log them in
                    console.log(doc);
                     res.json(doc.userId);
                     
                } else {
                    console.log("call rej with google");
                    // if the user isnt in our database, create a new user
                    signup.registerNewUserFromMobile(data.platform, data.type, data.user, data.token, "refreshToken",  function(err,newUser){
                           if(err){
                            console.log(err);
                            res.json("error");
                        }else{
                            console.log(newUser);
                            req.user = newUser;
                            req.mobile = true;
                            Controller.createMP(req,res);
                            // res.json(newUser.userId);
                        }

                   });
                        // return done(null, newUser);
                }
            });
       }
       
           
    });




    //Producer Wizard - a step in Producer registration
    app.get('/ProducerWizard', function (req, res){
        var uploadsList = [];
        var genres = [];
        async.parallel([
            function(callback){
                if(typeof req.user !== 'undefined' && req.user){
                    request("https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&key=AIzaSyCFLDEh1SbsSvQcgEVHuMOGfKefK8Ko-xc&access_token=" + req.user.YT_AT, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var temp = JSON.parse(body);


                            //can't register as producer if there are no uploads in youtube channel
                            if(temp.items.length > 0){
                                //get channel id from youtube and save to DB
                                var channelID = temp.items[0].id;
                                console.log("channelID: " + channelID);
                                var update = {YT_channelId: channelID};
                                User.findOneAndUpdate({ 'userId' : req.user.userId },update,function(err, user) {
                                    if (err)
                                        console.log(err);
                                    if (user) {
                                        req.user = user;
                                    }
                                    
                                    var uploadsPlaylistID =  temp.items[0].contentDetails.relatedPlaylists.uploads;

                                    Controller.getProducerPlaylistItems(uploadsPlaylistID, req.user.YT_AT, function(error, list){
                                        if(error){
                                            console.log(error);
                                        }
                                        uploadsList = list;
                                        // console.log(list);
                                        callback();
                                    });

                                });
                            }else{
                                console.log("can't register as producer, no songs!");
                                //TODO: return this error to client
                                res.redirect('/');
                            }
                            
                        }else{
                            console.log("error with http request to google. check ip settings in google console");
                            Controller.deleteUser(null,req.user.userId);
                            res.redirect('/');
                        }
                    });
                }else{
                    res.redirect('/');
                }                    
            }
            ,
            function(callback){
                GenreS.find({ category: { $exists: true } },function (err, docs) {
                      if (err) {
                        callback(err);
                        return;
                      }

                      genres = docs;
                      for(var i=0; i<genres.length; i++){
                        genres[i].name =  capitalizeEachWord(genres[i].name);
                      }
                      console.log("got all genres from DB");
                      callback();
                });
            }
        ],
        // optional callback
        function(err, results){
            // all done
            console.log("all done, render page");
             res.render('ProducerWizard.ejs', {
                user : req.user,
                list: uploadsList,
                genres: genres
            });
        });
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

     //edit profile form
    app.post('/editProfileForm', isLoggedIn, function (req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        app.set('json spaces', 4);
        res.set("Content-Type", "application/json");

        var data = {};
        data = req.body;
        Controller.editProfileForm(req,res,data);
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


app.param('userId', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
 app.param('song', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
app.param('artist', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
        //Remove Song from favorites
    app.get('/removeFav/:userId/:song/:artist', function (req, res, next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next(); 
        },

        function (req, res) {
        Controller.removeFav(res,req.params.userId,req.params.song,req.params.artist);
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






    //WHO TO FOLLOW
    app.param('userId', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    //route that recives parameter using defined parameters
    app.get('/whoToFollow/:userId', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            app.set('json spaces', 4);
            res.set("Content-Type", "application/json");
            res.status(200);
            next(); 
        },

        function (req, res) {
            ControllerB.whoToFollow(req.params.userId, function(err,result){
                if(err){
                    console.log(err);
                }else{
                    res.json(result);
                }
            });

            
        
    });






    //FOLLOW
    app.param('userF', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.param('Fuser', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    //route that recives parameter using defined parameters
    app.get('/addToFollow/:userF/:Fuser', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
        ControllerB.addToFollow(res,req.params.userF,req.params.Fuser);
    });








    //UNFOLLOW
    // app.param('userF', function ( req, res, next, value){
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });
    // app.param('Fuser', function ( req, res, next, value){
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });
    //route that recives parameter using defined parameters
    app.get('/unfollow/:userF/:Fuser', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
        ControllerB.unfollow(res,req.params.userF,req.params.Fuser);
    });










    //Find match
    // app.param('userIDM', function ( req, res, next, value){
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });

    // //route that recives parameter using defined parameters
    // app.get('/findMatch/:userIDM', 
    //     function (req, res, next){
    //         res.header("Access-Control-Allow-Origin", "*");
    //         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //         next(); 
    //     },

    //     function (req, res) {
    //     ControllerB.findMatch(req.params.userIDM);
    // });










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
	 app.param('oneGenre', function ( req, res, next, value){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    //route that recives parameter using defined parameters
    app.get('/getPlaylist/:uid/:mode/:limit/:genre/:oneGenre', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
        	console.log("request for playlist with user id " +req.params.uid + " on mode " +req.params.mode + " list length " +req.params.limit + " genre: " + req.params.genre + "oneGenre mode:" + req.params.oneGenre);
        DJ.getUserPlaylist(res,req.params.uid,req.params.mode,req.params.limit, req.params.genre,req.params.oneGenre);
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

     app.param('userID', function ( req, res, next, value){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
     });

     app.get('/updateCounters/:prodID/:songID/:userID', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
            console.log("request for updateCounters with user id " +req.params.prodID + " song id " + req.params.songID + " user id " + req.params.userID);
            ProducerController.updateCounters(res,req.params.prodID, req.params.songID, req.params.userID);
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
	   
	   //download AS
	   app.get('/downloadAS', function(req, res){
  var file = __dirname + '/uploads/AS.zip';
  res.download(file); // Set disposition and send it.
});




       //handle Contact Us Form
    app.post('/handleContactUsForm', function (req, res){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        app.set('json spaces', 4);
        res.set("Content-Type", "application/json");
        res.status(200);

        var text = 'Message from ' + req.body.firstName + ": " + req.body.msg;
            var mailOptions = {
                from: req.body.email, // sender address
                to: 's.almog88@gmail.com, viktoria5660@gmail.com', // list of receivers
                subject: 'The Music Profile : new message via Contact Us form', // Subject line
                text: text //, // plaintext body
                // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                    res.json({yo: 'error'});
                }else{
                    console.log('Message sent: ' + info.response);
                    res.json({yo: info.response});
                };
            });
    });




    app.get('/getUsers/', 
        function (req, res, next){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next(); 
        },

        function (req, res) {
        Controller.getUsers(res);
    });


     function capitalizeEachWord(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}




//===============PORT=================
	server.listen(process.env.PORT || 3000);
	server.timeout = 240000; // for testings..
	console.log("The magic happens on port 3000");

