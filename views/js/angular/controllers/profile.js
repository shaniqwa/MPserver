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
  $scope.userId;
  $scope.favorits = [];
  $scope.BL = [];
  $scope.defaultGenre = [];
  $scope.heart = "fa-heart-o";
  $scope.red = [];
  $scope.data = {
    select: 'P',
    option1: 'P',
    option2: 'B',
   };
   $scope.track = [];
   $scope.toggle = true;
   $scope.videoFrame = false;
   $scope.videoFrame2 = false;
   $scope.nowPlaying = [];
   $scope.msg = [];
   $scope.elementToFadeInAndOut = '';
   $scope.loaderStatus = "invisible-loader";

   // create youtube player
    var player;
    function onYouTubePlayerAPIReady() {
         player = new YT.Player('player', {
          height: '250',
          width: '100%',
          videoId: '',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          },
          playerVars: { 
            'autoplay': 0,
            'controls': 0, 
            'rel' : 0,
            'showinfo': 0
          }
        });

        
    }
    

     // autoplay video
     function onPlayerReady(event) {
        console.log("player ready");
        //event.target.playVideo();
        $scope.nextSong(); 
        event.target.playVideo();
        console.log("end of ready");
        $scope.$apply(function() {
          $scope.videoFrame = true;
          $scope.videoFrame2 = true;
          $scope.loaderStatus = "invisible-loader";
        });
    }

    // when video ends
     function onPlayerStateChange(event) {        
        if(event.data === 0) {            
            var next = angular.element( document.querySelector(".fa-fast-forward") );
            next.triggerHandler('click');
        }
    }

/***********************************************************/
/***************INIT FUNCTION - ON LOAD PAGE****************/
/***********************************************************/
  $scope.init = function(data){
       user = JSON.parse(data);
        $scope.userId = user.userId;
       $http.get('http://localhost:3000/getProducerSongs/' + prodId).success(function(data){
            console.log(data); 
           for(i in data.songs){
             $scope.songDetails.push({albumName: data.songs[i].albumName, artwork: data.songs[i].artwork, duration: data.songs[i].duration, name: data.songs[i].name, songId: data.songs[i].songId, year: data.songs[i].year, id:i}); 
           }
       });
       $http.get('http://localhost:3000/getFavorites/' + $scope.userId).success(function(data){
            for(i in data){
              $scope.favorits.push({artistName: data[i].artist, songName: data[i].song, duration: data[i].duration});
           }
       });
       $scope.selectedSong = 0;
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
       //onYouTubePlayerAPIReady();
  }; 
/***********************************************************/
/***************INIT FUNCTION - ON LOAD PAGE****************/
/***********************************************************/

/***********************************************************/
/****************bringMePlaylist FUNCTION*******************/
/***********************************************************/
    $scope.bringMePlaylist = function($event){
     //$scope.track = [];
     //$scope.counter = 0;
     if($scope.videoFrame == false)
     $scope.videoFrame2 = false;
   
     $scope.loaderStatus = "visible-loader";
    console.log("my select is: " + $scope.data.select);
    var myMode = ($scope.data.select == 'P') ? 1 : 2;
         if(typeof $event === 'undefined'){
            var genre =  $scope.defaultGenre;
         }
         else{
           var genre = $event.currentTarget.innerHTML;
           $scope.defaultGenre = genre;
         }
         console.log(genre);
         var url = "http://localhost:3000/getPlaylist/" + user.userId + "/" + myMode + "/" + 6 + "/" + genre;
         console.log(url);
         $http.get('http://localhost:3000/getPlaylist/' + user.userId + '/' + myMode + '/' + 6 + '/' + genre).success(function(data){
           console.log(data);
           for(i in data){
               if(typeof data[i].artistName === 'undefined'){
                 $scope.track.push({artistName: data[i].name, songName: data[i].albumName, url: data[i].artwork, active: 0});
               }
               else{
                 $scope.track.push({artistName: data[i].artistName, songName: data[i].songName, url: data[i].url, active: 0});
               }
           }
           onYouTubePlayerAPIReady();
         
      });
    };
/***********************************************************/
/****************bringMePlaylist FUNCTION*******************/
/***********************************************************/

/***********************************************************/
/*****************updatePlaylist FUNCTION*******************/
/***********************************************************/
    $scope.updatePlaylist = function($event){
     //$scope.track = [];
     //$scope.counter = 0;
    console.log("my select is: " + $scope.data.select);
    var myMode = ($scope.data.select == 'P') ? 1 : 2;
         if(typeof $event === 'undefined'){
            var genre =  $scope.defaultGenre;
         }
         else{
           var genre = $event.currentTarget.innerHTML;
           $scope.defaultGenre = genre;
         }
         console.log(genre);
         var url = "http://localhost:3000/getPlaylist/" + user.userId + "/" + myMode + "/" + 6 + "/" + genre;
         console.log(url);
         $http.get('http://localhost:3000/getPlaylist/' + user.userId + '/' + myMode + '/' + 6 + '/' + genre).success(function(data){
           console.log(data);
           for(i in data){
               if(typeof data[i].artistName === 'undefined'){
                 $scope.track.push({artistName: data[i].name, songName: data[i].albumName, url: data[i].artwork, active: 0});
               }
               else{
                 $scope.track.push({artistName: data[i].artistName, songName: data[i].songName, url: data[i].url, active: 0});
               }
           }
      });
    };
/***********************************************************/
/*****************updatePlaylist FUNCTION*******************/
/***********************************************************/

/***********************************************************/
/********************nextSong FUNCTION**********************/
/***********************************************************/
    $scope.nextSong = function(){
      //TODO: check it the comming song is already in favorits
        
        if($scope.heart == "fa-heart"){
          $scope.heart = "fa-heart-o";
        }
            if ($scope.counter < $scope.track.length){
              var url = $scope.track[$scope.counter].url.replace("watch?v=", "embed/"); 
              url += "?autoplay=0&cc_load_policy=1&showinfo=0&controls=0";
              console.log(url);
              $scope.myVideo = $sce.trustAsResourceUrl(url);
              player.cueVideoByUrl(url);
              $scope.track[$scope.counter].active = 1;
              console.log($scope.counter);
              $scope.nowPlaying = $scope.track[$scope.counter];
              if($scope.counter != 0){
                $scope.track[$scope.counter - 1].active = 0;
                $scope.track.splice([$scope.counter - 1],1);
                $scope.counter--;
                var myEl = angular.element( document.querySelector( ".repeatClass" + ($scope.counter - 1) ) );
                myEl.remove();
                //var myPause = angular.element( document.querySelector(".fa-pause") );
                //myPause.triggerHandler('click');
                //var myPlay = angular.element( document.querySelector(".fa-play") );
                //myPlay.triggerHandler('click');
                 //$scope.$apply();
                 player.pauseVideo();
                 player.playVideo();
              }
              $scope.counter++;
            }
            else{
              //bring me newplaylist
              //$scope.counter = 0;
               //$scope.updatePlaylist();
              
            }
            if($scope.track.length == 5){
                $scope.updatePlaylist();
            }
            player.pauseVideo();
            player.playVideo();
            //$scope.$apply();
    };
/***********************************************************/
/********************nextSong FUNCTION**********************/
/***********************************************************/

/***********************************************************/
/********************addToFav FUNCTION**********************/
/***********************************************************/
    $scope.addToFav = function(){
      $scope.elementToFadeInAndOut = '';
       $scope.favorits.push({artistName:  $scope.track[$scope.counter - 1].artistName, songName: $scope.track[$scope.counter - 1].songName, duration: "3:43"});
      if($scope.heart == "fa-heart-o"){
        $scope.heart = "fa-heart";
      }else{
        $scope.heart == "fa-heart-o"
      }
      var data = JSON.stringify({
                      userId : $scope.userId,
                      songData : {
                         song: $scope.track[$scope.counter - 1].songName,
                         artist: $scope.track[$scope.counter - 1].artistName,
                         duration: "3:43",
                         url:  $scope.track[$scope.counter - 1].url
                      }
                 });
      console.log("fav: " + $scope.track[$scope.counter - 1].songName + " " + $scope.track[$scope.counter - 1].artistName + " " + 1);
      $http.defaults.headers.post["Content-Type"] = "application/json";
      $http.post('http://localhost:3000/addToFavorites/',data).success(function(data,status){
           console.log(data);
           $scope.msg = "Added successfuly to your Favorites";
           $scope.elementToFadeInAndOut = "elementToFadeInAndOut";
      });
    };
/***********************************************************/
/********************addToFav FUNCTION**********************/
/***********************************************************/

/***********************************************************/
/*****************addToBlacklist FUNCTION*******************/
/***********************************************************/
    $scope.addToBlacklist = function(){
       $scope.elementToFadeInAndOut = '';
       $scope.BL.push({songName:  $scope.track[$scope.counter - 1].songName, artisrName: $scope.track[$scope.counter - 1].artistName});
      var data = JSON.stringify({
                    userId : $scope.userId,
                    songData : {
                       artist: $scope.track[$scope.counter - 1].artistName,
                       song: $scope.track[$scope.counter - 1].songName
                    }
                 });
      console.log("black: " + $scope.track[$scope.counter - 1].songName + " " + $scope.track[$scope.counter - 1].artistName + " " + 1);
      $http.defaults.headers.post["Content-Type"] = "application/json";
      $http.post('http://localhost:3000/addToBlackList/',data).success(function(data,status){
           console.log(data);
           $scope.msg = "Added successfuly to your Blacklist";
           $scope.elementToFadeInAndOut = "elementToFadeInAndOut";
      });
    };
/***********************************************************/
/*****************addToBlacklist FUNCTION*******************/
/***********************************************************/

/***********************************************************/
/********************pauseSong FUNCTION*********************/
/***********************************************************/
    $scope.pauseSong = function(){
      player.pauseVideo();
      $scope.toggle = false;
    };
/***********************************************************/
/********************pauseSong FUNCTION*********************/
/***********************************************************/

/***********************************************************/
/********************playSong FUNCTION**********************/
/***********************************************************/
    $scope.playSong = function(){
         player.playVideo();
         $scope.toggle = true;
    };
/***********************************************************/
/********************playSong FUNCTION**********************/
/***********************************************************/
});

