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

   $scope.data = {
    select: 'P',
    option1: 'P',
    option2: 'B',
   };
    //console.log(" rafi print---->" + $scope.currGenre);
    $scope.bringMePlaylist = function($event){
   	$scope.track = [];
    console.log("my select is: " + $scope.data.select);
    var myMode = ($scope.data.select == 'P') ? 1 : 2;
   	//$scope.mod.currGenre = currGenre;
         // console.log(" rafi print---->" + $scope.mod.currGenre );
         var genre = $event.currentTarget.innerHTML;
         console.log(genre);
         var url = "http://localhost:3000/getPlaylist/" + user.userId + "/" + myMode + "/" + 6 + "/" + genre;
         console.log(url);
        // alert(currGenre.toString() + $scope.currGenre)
          //console.log(currGenre);
         $http.get('http://localhost:3000/getPlaylist/' + user.userId + '/' + myMode + '/' + 6 + '/' + genre).success(function(data){
           console.log(data);
           if(typeof data === 'undefined'){

           }else{

           }
           for(i in data){
           	   if(typeof data[i].artistName === 'undefined'){
	               $scope.track.push({artistName: data[i].name, songName: data[i].albumName, url: data[i].artwork});
	           }
	           else{
	           	$scope.track.push({artistName: data[i].artistName, songName: data[i].songName, url: data[i].url});
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

