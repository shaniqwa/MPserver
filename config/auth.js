module.exports = {

    'facebookAuth' : {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '702717211821-6ejnl7kh0cjsr90m5eimhvb5dnprqkk9.apps.googleusercontent.com',
        'clientSecret'  : 'XWwxItYKE1faezV34IJbIDnn',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    }

};