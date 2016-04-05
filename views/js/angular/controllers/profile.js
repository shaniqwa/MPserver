var profile = angular.module('profile',[]);

var model = {
	
}

profile.controller('profileCtrl', function ($scope, $http) {
	$scope.mod = model;
	$scope.init = function(data){
       var user = JSON.parse(data);
       console.log(user); 

    }; 

   
       

    //console.log(" rafi print---->" + $scope.currGenre);
   $scope.bringMePlaylist = function(currGenre){
         console.log(" rafi print---->" + JSON.stringify($scope.mod) );
         $scope.mod = $scope.mod.currGenre;
         //alert(currGenre.toString() + $scope.currGenre)
          //console.log(currGenre);
         //$http.get('http://localhost:3000/getPlaylist/' + 59 + '/' + 1 + '/' + 10 + '/' + genre).success(function(data){
         //  console.log(data);
         //});
	     
    };
    

 


	/*$scope.getSong = function($event){
       var genre = $event.currentTarget.innerHTML;
        console.log($event.currentTarget.innerHTML);
         $http.get('http://localhost:3000/getPlaylist/' + 59 + '/' + 1 + '/' + 10 + '/' + genre).success(function(data){
           console.log(data);
         });
    };*/
    
});

