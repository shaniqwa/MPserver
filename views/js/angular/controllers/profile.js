var profile = angular.module('profile',[]);

var model = {
	
}
var user;
var prodId = 63;
profile.controller('profileCtrl', function ($scope, $http, $sce) {
	$scope.mod = model;
  $scope.songDetails = [];
  $scope.ageGroupCounters = [];
  $scope.songCounters = [];
  $scope.counter = 0;
  $scope.init = function(data){
       user = JSON.parse(data);
       // console.log(user); 
        
       $http.get('http://localhost:3000/getProducerSongs/' + prodId).success(function(data){
            console.log(data); 
           for(i in data.songs){
             $scope.songDetails.push({albumName: data.songs[i].albumName, artwork: data.songs[i].artwork, duration: data.songs[i].duration, name: data.songs[i].name, songId: data.songs[i].songId, year: data.songs[i].year, id:i}); 
           }
       });$scope.selectedSong = 0;
        $http.get('http://localhost:3000/getProducerStatistics/' + prodId).success(function(data){
           console.log(data);
           $scope.ageGroupCounters.push({ageGroup1Counter: data.ageGroup1Counter});
           $scope.ageGroupCounters.push({ageGroup2Counter: data.ageGroup2Counter});
           $scope.ageGroupCounters.push({ageGroup3Counter: data.ageGroup3Counter});
           $scope.ageGroupCounters.push({ageGroup4Counter: data.ageGroup4Counter});
           $scope.ageGroupCounters.push({ageGroup5Counter: data.ageGroup5Counter});
           $scope.ageGroupCounters.push({ageGroup6Counter: data.ageGroup6Counter});
           $scope.ageGroupCounters.push({counterLocal: data.counterLocal});
           $scope.ageGroupCounters.push({internalCounter: data.internalCounter});
           $scope.ageGroupCounters.push({totalCounter: data.totalCounter});
           $scope.ageGroupCounters.push({artistName: data.userId});
           for(i in data.songs){ 
             $scope.songCounters.push({counterAgeGroup1: data.songs[i].counterAgeGroup1, counterAgeGroup2: data.songs[i].counterAgeGroup2, counterAgeGroup3: data.songs[i].counterAgeGroup3, counterAgeGroup4: data.songs[i].counterAgeGroup4, counterAgeGroup5: data.songs[i].counterAgeGroup5, counterAgeGroup6: data.songs[i].counterAgeGroup6, counterLocal: data.songs[i].counterLocal, counterTotal: data.songs[i].counterTotal, songId: data.songs[i].songId, counterInternal: data.songs[i].counterInternal}); 
           }

       });
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
        $scope.returnUrl();  });
	     
    };
    
    $scope.returnUrl = function(){
          console.log($scope.track.length);
          var url = $scope.track[$scope.counter].url.replace("watch?v=", "embed/"); 
          url += "?autoplay=1&cc_load_policy=1&showinfo=0&controls=0";
          console.log(url);
          $scope.myVideo = $sce.trustAsResourceUrl(url);
           $scope.clickMe(); 
          $scope.counter = $scope.counter++;
         
    };
 
    $scope.clickMe = function(){
       $("iframe").click()[0];
       $("embed").click()[0];
    }

	/*$scope.getSong = function($event){
       var genre = $event.currentTarget.innerHTML;
        console.log($event.currentTarget.innerHTML);
         $http.get('http://localhost:3000/getPlaylist/' + 59 + '/' + 1 + '/' + 10 + '/' + genre).success(function(data){
           console.log(data);
         });
    };*/
    
});

