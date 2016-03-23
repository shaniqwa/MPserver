var express = require('express'),
	app = express(),
	Controller = require('./Controller');

var bodyParser = require('body-parser');
	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
	

	app.use('/', express.static('./public'));

	//route that return all genres objects in our data base in a json format
	app.post('/registerConsumer', function (req, res){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		app.set('json spaces', 4);
		res.set("Content-Type", "application/json");
		res.status(200);

		var data = {};
		data.username = req.body.username;
		data.firstName = req.body.firstName;
		data.lastName = req.body.lastName;
		data.password = req.body.password;
		data.ageGroup = req.body.ageGroup;
		data.email = req.body.email;
		data.FB_AT = req.body.FB_AT;
		data.FB_RT = req.body.FB_RT;
		data.YT_AT = req.body.YT_AT;
		data.YT_RT = req.body.YT_RT;
		data.country = req.body.country;
		data.profileImage = req.body.profileImage;
		data.mode = req.body.mode;
		data.typeOfUser = req.body.typeOfUser;

		res.json(Controller.registerConsumer(data));
	});


	//route that return a genre object by passing it's name as parameter
	app.param('genre', function ( req, res, next, value){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		console.log("\nRequest recived with genre: " + value);
		next();
	});

	//route that recives parameter using defined parameters - enter a genre to get info about it. res parsed to json
	app.get('/genre/:genre', 

		function (req, res, next){
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next(); 
		},

		function (req, res) {
		res.status(200).json(MP.getRelatedTo(req.params.genre));
	});


	// FACEBOOK
	//define route MP with parameter FBat (fabebook access token).
	app.param('FBac', function ( req, res, next, value){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		console.log("\nRequest recived with genre: " + value);
		next();
	});
	// YOUTUBE
	//define route MP with parameter YTat (youtube access token).
	app.param('YTac', function ( req, res, next, value){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		console.log("\nRequest recived with genre: " + value);
		next();
	});

	//route that recives parameter using defined parameters - enter FB/YT/both access token to get  music info about it
	app.get('/MP/:FBat/:YTat', 
		function (req, res, next){
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next(); 
		},

		function (req, res) {
		MP.getMP(req, res, req.params.FBat,req.params.YTat);
	});


		// ONLY YOUTUBE
	//define route MP with parameter YTat (youtube access token).
	app.param('YT', function ( req, res, next, value){
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		console.log("\nRequest recived with genre: " + value);
		next();
	});

		//route that recives parameter using defined parameters - enter FB/YT/both access token to get  music info about it
	app.get('/test/:YT', 
		function (req, res, next){
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next(); 
		},

		function (req, res) {
		MP.YouTube(req, res, req.params.YT);
	});



	app.listen(process.env.PORT || 3000);
	console.log("service is listening on port 3000");