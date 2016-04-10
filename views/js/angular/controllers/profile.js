var profile = angular.module('profile',[]);

var model = {
	
}
var user;
profile.controller('profileCtrl', function ($scope, $http) {
	$scope.mod = model;
	$scope.init = function(data){
       user = JSON.parse(data);
       // console.log(user); 

    }; 

   
       

    //console.log(" rafi print---->" + $scope.currGenre);
   $scope.bringMePlaylist = function($event){
   	$scope.track = [];
   	//$scope.mod.currGenre = currGenre;
         // console.log(" rafi print---->" + $scope.mod.currGenre );
         var genre = $event.currentTarget.innerHTML;
         console.log(genre);
         var url = "http://localhost:3000/getPlaylist/" + user.userId + "/" + user.mode + "/" + 10 + "/" + genre;
         console.log(url);
        // alert(currGenre.toString() + $scope.currGenre)
          //console.log(currGenre);
         $http.get('http://localhost:3000/getPlaylist/' + user.userId + '/' + user.mode + '/' + 6 + '/' + genre).success(function(data){
           console.log(data);
           if(typeof data === 'undefined'){

           }else{

           }
           for(i in data){
           	   if(typeof data[i].artist === 'undefined'){
	               $scope.track.push({artistName: data[i].name, songName: data[i].albumName});
	           }
	           else{
	           	$scope.track.push({artistName: data[i].artist.name, songName: data[i].name});
	           }
	           	  
	       }
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

