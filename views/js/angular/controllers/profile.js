var profile = angular.module('profile',[]);

profile.controller('profileCtrl', function ($scope, $http) {
	$scope.init = function(data){
       var user = JSON.parse(data);
       console.log(user); 
    };
	/*$scope.getSong = function($event){
       var genre = $event.currentTarget.innerHTML;
        console.log($event.currentTarget.innerHTML);
         $http.get('http://localhost:3000/getPlaylist/' + 59 + '/' + 1 + '/' + 10 + '/' + genre).success(function(data){
           console.log(data);
         });
    };*/
});

