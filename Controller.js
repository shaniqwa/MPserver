var Consumer = require('./Consumer.js');

exports.test = function() {
	var data = {
	    username: "test",
	    firstName: "test",
	    lastName: "test",
	    password: "test",
	    ageGroup: 20,
	    email: "test@com",
	    FB_AT: "test",
	    FB_RT: "test",
	    YT_AT: "test",
	    YT_RT: "test",
	    country: "test",
	    profileImage: "test",
	    mode: 1,
	    typeOfUser: "Consumer"
	}
	var myUser = new Consumer(data);
	myUser.changeName("shani");
	return myUser;
}