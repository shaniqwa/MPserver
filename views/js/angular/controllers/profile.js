var profile = angular.module('profile',[]);

var model = {
	
}
var user;
profile.controller('profileCtrl', function ($scope, $http) {
	$scope.mod = model;
	$scope.init = function(data){
       user = JSON.parse(data);
       console.log(user); 

    }; 

   
       

    //console.log(" rafi print---->" + $scope.currGenre);
   $scope.bringMePlaylist = function($event){
   	//$scope.mod.currGenre = currGenre;
         // console.log(" rafi print---->" + $scope.mod.currGenre );
         var genre = $event.currentTarget.innerHTML;
         console.log(genre);
         var url = "http://localhost:3000/getPlaylist/" + user.userId + "/" + user.mode + "/" + 10 + "/" + genre;
         console.log(url);
        // alert(currGenre.toString() + $scope.currGenre)
          //console.log(currGenre);
         $http.get('http://localhost:3000/getPlaylist/' + user.userId + '/' + user.mode + '/' + 10 + '/' + genre).success(function(data){
           console.log(data);
         });
	     
    };
    

 


	/*$scope.getSong = function($event){
       var genre = $event.currentTarget.innerHTML;
        console.log($event.currentTarget.innerHTML);
         $http.get('http://localhost:3000/getPlaylist/' + 59 + '/' + 1 + '/' + 10 + '/' + genre).success(function(data){
           console.log(data);
         });
    };*/
    
});

