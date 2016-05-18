
var profile = angular.module('profile',[]);

var model = {
  
}

var business;
var songs;
var artist;


profile.controller('profileCtrl', function ($scope, $http, $sce) {
  $scope.mod = model;
  $scope.songDetails = [];
  $scope.ageGroupCounters = [];
  $scope.songCounters = [];
  $scope.counter = 0;
  $scope.userId;
  $scope.isLoggedIn = true;
  $scope.myID;
  $scope.favorits = [];
  $scope.BL = [];
  $scope.defaultGenre = [];
   $scope.reco = [];  
  $scope.heart = "fa-heart-o";
  $scope.red = [];
  $scope.data = {
    select: 'P',
    option1: 'P',
    option2: 'B',
    option3: 'A'
   };
   $scope.track = [];
   $scope.toggle = true;
   $scope.videoFrame = false;
   $scope.videoFrame2 = false;
   $scope.videoFrame3 = false;
   $scope.nowPlaying = [];
   $scope.msg = [];
   $scope.elementToFadeInAndOut = '';
   $scope.loaderStatus = "invisible-loader";
   $scope.loaderStatus2 = "invisible-loader";
   $scope.firstTimePlaylist = false;
   $scope.user;
   $scope.business = [];
   $scope.pleasure = [];
   $scope.artist;
   $scope.songs;
   $scope.selectedSong;
   // create youtube player
    var player;

    function activaTab(tab){
        $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    };

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
        // console.log("player ready");
        //event.target.playVideo();
        $scope.nextSong(); 
        event.target.playVideo();
        // console.log("end of ready");
        $scope.$apply(function() {
          $scope.videoFrame = true;
          $scope.videoFrame2 = true;
          $scope.videoFrame3 = true;
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
  $scope.init = function(userID){
        $scope.userId = JSON.parse(userID);
        if($scope.isLoggedIn == true){
          $scope.myID = $scope.userId;
          $scope.isLoggedIn = false;
        }
         $scope.selectedSong = 0;
        // get user info
        $http.get('http://themusicprofile.com/getUser/' + $scope.userId).success(function(data){
            $scope.user = data.user;
            $scope.business = data.business.genres;
            $scope.pleasure = data.pleasure.genres;
         
            drawPie($scope.pleasure, $scope.user.profileImage);
            activaTab('profile');
            

            if($scope.user.typeOfUser == "Producer"){
                $scope.songs = data.songs;
                $scope.artist = data.artist;

               $http.get('http://themusicprofile.com/getProducerStatistics/' + $scope.userId).success(function(data){
                   // console.log(data);
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
                   drawAgeGroupDiagram($scope.songCounters[$scope.selectedSong]);
                   drawLocalVsWorldDiagram();
               });

            }//end if producer

                  // get user's favorits
                  $http.get('http://themusicprofile.com/getFavorites/' + $scope.userId).success(function(data){
                      $scope.favorits = [];
                      for(i in data){
                        $scope.favorits.push({artistName: data[i].artist, songName: data[i].song, duration: data[i].duration});
                     }
                  });

                  
                  // if producer: get songs and statistics
                  if($scope.user.typeOfUser == "Producer"){
                         
                  }//END  if producer: get songs and statistics
        });

        

        // get recommendation
       // $scope.recommandation($scope.userId);
  $http.get('http://themusicprofile.com/recommandation/' + $scope.userId).success(function(data){ 
    console.log(data);
    for (i in data){
      $scope.reco.push({firstName : data[i].firstName , lastName: data[i].lastName , username : data[i].username , profileImage : data[i].profileImage , type : data[i].type});
    }
  });
       
       
       
        
       //onYouTubePlayerAPIReady();
  }; 

$scope.changePie = function(mode){
  $('.mode-btn').removeClass('active');
  if(mode == "pleasure"){
    drawPie($scope.pleasure, $scope.user.profileImage);
     $('#pleasure').addClass('active');
  }
  if(mode == "business"){
    drawPie($scope.business, $scope.user.profileImage);
    $('#business').addClass('active');
  }
  if(mode == "artist"){
    drawPie($scope.artist.genres, $scope.user.profileImage);
    $('#artist').addClass('active');
  }
}
/***********************************************************/
/****************bringMePlaylist FUNCTION*******************/
/***********************************************************/
$scope.bringMePlaylist = function($event){
    $scope.track = [];
    $scope.counter = 0;
    $scope.videoFrame3 = false;
    if($scope.videoFrame == false){
        $scope.videoFrame2 = false; 
    }
     
    $scope.loaderStatus = "visible-loader";
    $scope.loaderStatus2 = "visible-loader";
    // console.log("my select is: " + $scope.data.select);
    var myMode = ($scope.data.select == 'P') ? 1 : 2;
    
    if(typeof $event === 'undefined'){
        var genre =  $scope.defaultGenre;
    }
    else{
        var genre = $event.currentTarget.innerHTML;
        $scope.defaultGenre = genre;
    }
         // console.log(genre);
    var url = "http://themusicprofile.com/getPlaylist/" + $scope.user.userId + "/" + myMode + "/" + 6 + "/" + genre;
         // console.log(url);
    $http.get('http://themusicprofile.com/getPlaylist/' + $scope.user.userId + '/' + myMode + '/' + 6 + '/' + genre).success(function(data){
           // console.log(data);
           $scope.videoFrame3 = true;
           for(i in data){
               if(typeof data[i].artistName === 'undefined'){
                 $scope.track.push({artistName: data[i].name, songName: data[i].albumName, url: data[i].artwork, active: 0});
               }
               else{
                 $scope.track.push({artistName: data[i].artistName, songName: data[i].songName, url: data[i].url, active: 0});
               }
           }
           if($scope.firstTimePlaylist == false){
               onYouTubePlayerAPIReady();
               $scope.firstTimePlaylist = true;
           }
          $scope.loaderStatus2 = "invisible-loader";
          $scope.nextSong();
      });
    };




/***********************************************************/
/****************SEARCH FUNCTION*******************/
/***********************************************************/
$scope.search = function(text){

activaTab('search');
  $scope.searchResults = [];  
  $http.get('http://themusicprofile.com/searchuser/' + text).success(function(data){ 
    for (i in data){
       $scope.searchResults.push({userID: data[i].userID, firstName : data[i].firstName , lastName: data[i].lastName , username : data[i].username , profileImage : data[i].profileImage , type : data[i].type});
    }
  });
};







/***********************************************************/
/****************FOLLOW FUNCTION*******************/
/***********************************************************/
$scope.follow = function(myID, userID){
  $scope.searchResults = [];  
  $http.get('http://themusicprofile.com/addToFollow/' + myID + '/' + userID).success(function(data){ 
  });
};





/***********************************************************/
/****************DRAW DIAGRAM*******************************/
/***********************************************************/
$scope.drawDiagram = function(index){
  console.log($scope.songCounters[index]);
  //$scope.selectedSong = numberOfSong;
  drawAgeGroupDiagram($scope.songCounters[index]);
  activaTab('statistics');
};





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
         // console.log(genre);
         var url = "http://themusicprofile.com/getPlaylist/" + $scope.user.userId + "/" + myMode + "/" + 6 + "/" + genre;
         // console.log(url);
         $http.get('http://themusicprofile.com/getPlaylist/' + $scope.user.userId + '/' + myMode + '/' + 6 + '/' + genre).success(function(data){
           // console.log(data);
           for(i in data){
               if(typeof data[i].artistName === 'undefined'){
                 $scope.track.push({artistName: data[i].name, songName: data[i].albumName, url: data[i].artwork, active: 0});
               }
               else{
                 $scope.track.push({artistName: data[i].artistName, songName: data[i].songName, url: data[i].url, active: 0});
               }
           }
           $scope.videoFrame3 = false;
           $scope.loaderStatus2 = "invisible-loader";
      });
    };





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
              // console.log(url);
              $scope.myVideo = $sce.trustAsResourceUrl(url);
              player.cueVideoByUrl(url);
              $scope.track[$scope.counter].active = 1;
              // console.log($scope.counter);
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
            if($scope.track.length == 1){
                $scope.videoFrame3 = true;
                $scope.loaderStatus2 = "visible-loader";
            }
            player.pauseVideo();
            player.playVideo();
            //$scope.$apply();
    };






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
      $http.post('http://themusicprofile.com/addToFavorites/',data).success(function(data,status){
           console.log(data);
           $scope.msg = "Added successfuly to your Favorites";
           $scope.elementToFadeInAndOut = "elementToFadeInAndOut";
      });
    };







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
      $http.post('http://themusicprofile.com/addToBlackList/',data).success(function(data,status){
           console.log(data);
           $scope.msg = "Added successfuly to your Blacklist";
           $scope.elementToFadeInAndOut = "elementToFadeInAndOut";
      });
    };








/***********************************************************/
/*****************recommandation FUNCTION*******************/
/***********************************************************/ 


$scope.recommandation = function(userId){
console.log("inside recommandation");

  $http.get('http://themusicprofile.com/recommandation/' + userId).success(function(data){ 
    console.log(data);
    for (i in data){
      $scope.reco.push({firstName : data[i].firstName , lastName: data[i].lastName , username : data[i].username , profileImage : data[i].profileImage , type : data[i].type});
    }
  });


 };

/***********************************************************/
/*****************recommandation FUNCTION*******************/
/***********************************************************/ 



/***********************************************************/
/********************pauseSong FUNCTION*********************/
/***********************************************************/
    $scope.pauseSong = function(){
      player.pauseVideo();
      $scope.toggle = false;
    };






/***********************************************************/
/********************playSong FUNCTION**********************/
/***********************************************************/
    $scope.playSong = function(){
         player.playVideo();
         $scope.toggle = true;
    };




});



// get song duration from youtube
// https://www.googleapis.com/youtube/v3/videos?id=9bZkp7q19f0&part=contentDetails&key=AIzaSyAj8gdaFuSOQ2nBnBh1ShUVRsuhxoWFsXk

