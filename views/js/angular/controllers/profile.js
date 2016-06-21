var model = {
   domain: "http://localhost:3000"
   // domain: "http://themusicprofile.com"
}

var business;
var songs;
var artist;
var hours;
var seconds;
var minutes;
var songWasDeleted = false;
var iframe = $('#player');
var views;
var sub;
var com;
angular.module('profile',['datatables']).filter('titleCase', function() {
    return function(input) {
      input = input || '';
      return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };
  })
.controller('profileCtrl', function ($scope, $http, $sce, $interval, $timeout, DTOptionsBuilder) {

   $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withDisplayLength(10)
        .withOption('bLengthChange', true);

  // $scope.domain = "http://themusicprofile.com";
  //$scope.domain = "http://localhost:3000";
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
  $scope.fafollow = "fa-plus";
  $scope.isFollowing = "Follow";
  $scope.red = [];
  $scope.data = {
    select: 'P',
    option1: 'P',
    option2: 'B',
    option3: 'A'
   };
   $scope.track = [];
   $scope.tempTrack = [];
   $scope.firstTracks = [];
   $scope.toggle = true;
   $scope.videoFrame = false;
   $scope.videoFrame2 = false;
   $scope.videoFrame3 = false;
   $scope.nowPlaying = [];
   $scope.msg = '';
   $scope.elementToFadeInAndOut = '';
   $scope.elementToFadeInAndOut2 = '';
   $scope.loaderStatus = "invisible-loader";
   $scope.loaderStatus2 = "invisible-loader";
   $scope.firstTimePlaylist = false;
   $scope.user;
   $scope.business = [];
   $scope.businessPreferences = [];
   $scope.pleasure = [];
   $scope.pleasurePreferences = [];
   $scope.artist;
   $scope.songs;
   $scope.selectedSong;
   $scope.UserIsLoggedIn = false;
   $scope.iCameFromMyPlaylist = false;
   $scope.videoDuration;
   $scope.timer;
   $scope.tickInterval = 1000; //ms
   $scope.ticktickInterval = 150; //ms
   $scope.timeWidth;
   $scope.timeHeight;
   $scope.removedSongsIndexes = [];
   $scope.elementIsEmpty;
   $scope.tickColor = 1;
   $scope.generalLoader;
   $scope.token;
   $scope.views = 0;
   $scope.subscribers = 0;
   $scope.comments = 0;
    $scope.firstTimeStatistics = true;
    $scope.singleORdj = 0;
    $scope.thisIsNotFirstTimePlaylist = false;
    $scope.fawhat = '';
    $scope.tracksYouMayLike = [];
    $scope.newFlag = false;
    $scope.globalMode = "P";
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
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
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
        if($scope.firstTimePlaylist == false){
          $scope.firstTimePlaylist = true;
          $timeout(function(){
               //player.playVideo();
                $(".fa-pause")[0].click();
                $(".fa-pause").trigger('click');
                $(".fa-play")[0].click();
                $(".fa-play").trigger('click');
                $scope.toggle = false

            },900);
         

        }
        $scope.$apply(function() {
          $interval(tick, $scope.tickInterval);
          $scope.videoFrame = true;
          $scope.videoFrame2 = true;
          $scope.videoFrame3 = true;
          $scope.loaderStatus = "invisible-loader";
        });
    }


 
     function onPlayerStateChange(event) {  

        if(event.data === 0) {    //video ended
            
            var next = angular.element( document.querySelector(".fa-fast-forward") );
            next.triggerHandler('click');

        }
        if(event.data === 1){   //video playing
          $scope.elementToFadeInAndOut3 = '';
           $timeout(function(){
              $scope.elementToFadeInAndOut3 = "elementToFadeInAndOut2";
            },100);
          $scope.$apply(function() {
            $scope.toggle = true;
            
            hours = new Date(player.getDuration() * 1000).toISOString().substr(11, 2);
            seconds = new Date(player.getDuration() * 1000).toISOString().substr(14, 2);
            minutes = new Date(player.getDuration() * 1000).toISOString().substr(17, 2);
            if(parseInt(hours) == 0){
               if(parseInt(seconds) == 0){
                  
               }
               else{
                   $scope.videoDuration = new Date(player.getDuration() * 1000).toISOString().substr(14, 5);
                  if(parseInt(seconds) < 10){
                    $scope.videoDuration = new Date(player.getDuration() * 1000).toISOString().substr(15, 4);
                  } 
               }
            }
            else{
              $scope.videoDuration = new Date(player.getDuration() * 1000).toISOString().substr(11, 8);
            }
            
           
            
            $scope.updateCounters();
          });  
        }
         if(event.data === -1){  //video unstarted
              
        }
         if(event.data === 2){  //video paused
         
           $scope.$apply(function() {
              $scope.toggle = false;
              $scope.elementToFadeInAndOut2 = '';
               $timeout(function(){
                  $scope.elementToFadeInAndOut2 = "elementToFadeInAndOut2";
                },100);
          });
        }
         if(event.data === 3){  //video buffering
          
        }
         if(event.data === 5){  //video cued
          
        }
       
    }
$(document).on("click", ".navTimer2", function(){
    jQuery(document).on('keyup',function(evt) {
        if (evt.keyCode == 27) {
          console.log("esc");
           $scope.closeFullScreen();
        }
    });
});
       
      var tick = function(){
       //$scope.timer = new Date(player.getCurrentTime() * 1000).toISOString().substr(11, 8);
            $(".navTimer2")[0].click();
            $(".navTimer2").trigger('click'); 
            hours = new Date(player.getDuration() * 1000).toISOString().substr(11, 2);
            seconds = new Date(player.getDuration() * 1000).toISOString().substr(14, 2);
            minutes = new Date(player.getDuration() * 1000).toISOString().substr(17, 2);
            if(parseInt(hours) == 0){
               if(parseInt(seconds) == 0){
                  
               }
               else{
                   $scope.timer = new Date(player.getCurrentTime() * 1000).toISOString().substr(14, 5);
                  if(parseInt(seconds) < 10){
                    $scope.timer = new Date(player.getCurrentTime() * 1000).toISOString().substr(15, 4);
                  } 
               }
            }
            else{
              $scope.timer = new Date(player.getCurrentTime() * 1000).toISOString().substr(11, 8);
            }
         
        if($scope.tickColor == 1){
          $scope.color = "00bfff";
          $scope.tickColor = $scope.tickColor + 1;
          //$scope.timeHeight = 4;
        }
        else if($scope.tickColor == 2){
          $scope.color = "3772ff";
          $scope.tickColor = $scope.tickColor + 1;
        }
        else if($scope.tickColor == 3){
          $scope.color = "8a00ff";
          $scope.tickColor = $scope.tickColor + 1;
        }
        else if($scope.tickColor == 4){
          $scope.color = "d31fa4";
         $scope.tickColor = $scope.tickColor + 1;
        }
        else if($scope.tickColor == 5){
          $scope.color = "ff1a7c";
          $scope.tickColor = $scope.tickColor + 1;
        }
        else if($scope.tickColor == 6){
          $scope.color = "fc6b24";
         $scope.tickColor = 1;
         //$scope.timeHeight = 5;
        }
       var tempTimer = player.getCurrentTime() / player.getDuration();
       $scope.timeWidth = tempTimer * 100;
      
       
       //$scope.color = hours.toString() + seconds.toString() + minutes.toString();
       
       //console.log( $scope.tickColor);
      }

      


      // 2 – The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
      // 5 – The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
      // 100 – The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.
      // 101 – The owner of the requested video does not allow it to be played in embedded players.
      // 150 – This error is the same as 101. It's just a 101 error in disguise!
  function onPlayerError(event){
        console.log("error accured - onPlayerError function");
         $scope.nextSong();
         if(event.data == 2){
            $scope.nextSong();
         }
         if(event.data == 5){
            $scope.nextSong();
         }
         if(event.data == 100){
            //TODO CATCH ERROR AND CHANGE SONG
            $scope.nextSong();
         }
         if(event.data == 101){
            $scope.nextSong();
         }
         if(event.data == 150){
            $scope.nextSong();
         }
      }
      

var ticktick1 = function(){
         if($scope.views<views){
             $scope.views++;
         }
         if($scope.subscribers<sub){ 
            $scope.subscribers++;
         }
        if($scope.comments<com){
            $scope.comments++;
         }
}

/***********************************************************/
/***************INIT FUNCTION - ON LOAD PAGE****************/
/***********************************************************/
  $scope.init = function(userID){
    $scope.autosearchResults = [];  
     $scope.thereAreSongsInPlaylist = true;
      if($scope.videoFrame == false){
        $scope.videoFrame2 = false; 
      }
        $scope.userId = JSON.parse(userID);
        if($scope.isLoggedIn == true){
          $scope.myID = $scope.userId;
          $scope.isLoggedIn = false;
        }
         $scope.selectedSong = 0;
        // get user info
        $http.get(model.domain + '/getUser/' + $scope.userId).success(function(data){
            $scope.user = data.user;
            $scope.token = data.user.activityToken;
            $scope.business = data.business.genres;
            $scope.businessPreferences = data.business.preferences;

            $scope.pleasure = data.pleasure.genres;

            $scope.pleasurePreferences = data.pleasure.preferences;


            

             if($scope.UserIsLoggedIn == false){
              if($scope.firstTimePlaylist == false){
                   $scope.UserIsLoggedIn = true;
                   //onYouTubePlayerAPIReady();
                   //$scope.firstTimePlaylist = true;
                    var allGenres = [];
                    if($scope.data.select == 'B'){
                       for(i in data.business.genres){
                        allGenres.push(data.business.genres[i].genreName);
                     }
                    }
                    if($scope.data.select == 'P'){
                      for(j in data.pleasure.genres){
                            allGenres.push(data.pleasure.genres[j].genreName);
                     }
                    }
                     
                     
                     var getRandomNumber = Math.floor((Math.random() * allGenres.length));
                     model.randomGenre = allGenres[getRandomNumber];

                      // $scope.updatePlaylist(model.randomGenre);
              }
            }

            

            drawPie($scope.pleasure, $scope.user.profileImage);
            activaTab('profile');
            
             

           
            // get user's favorits
            $http.get(model.domain + '/getFavorites/' + $scope.userId).success(function(data){
                $scope.favorits = [];
                $scope.tracksYouMayLike = [];
                for(i in data){
                  $scope.favorits.push({artistName: data[i].artist, songName: data[i].song, duration: data[i].duration,url: data[i].url});
                }
                model.myfavorites = $scope.favorits; 
                if((model.myfavorites).length > 1){
                   $scope.newFlag = true;
                   $scope.tracksYouMayLike.push({artistName: model.myfavorites[0].artistName, songName: model.myfavorites[0].songName, duration: model.myfavorites[0].duration,url: model.myfavorites[0].url});
                   $scope.tracksYouMayLike.push({artistName: model.myfavorites[1].artistName, songName: model.myfavorites[1].songName, duration: model.myfavorites[1].duration,url: model.myfavorites[1].url});
                }
               
            });

              

            // get recommendation
           // $scope.recommandation($scope.userId);
            $http.get(model.domain + '/recommandation/' + $scope.userId).success(function(data){ 
               $scope.reco = []; 
              for (i in data){
                $scope.reco.push({userId: data[i].userID, firstName : data[i].firstName , lastName: data[i].lastName , username : data[i].username , profileImage : data[i].profileImage , type : data[i].type});
              }
            });


            //follow
            $scope.isFollowing = "Follow";
            $scope.fafollow = "fa-plus";
            if($scope.myID != $scope.user.userId){
                // console.log("you are on profile of user: " +  $scope.user.userId);
                  // check if the logged in user is following the current user
                  for(var i=0; i<$scope.user.followers.length; i++){
                      // console.log($scope.user.followers[i].userId);
                      // console.log("my id: " + $scope.myID);
                      if($scope.user.followers[i].userId == $scope.myID){
                        // console.log($scope.myID + " is following " + $scope.user.userId);
                        $scope.fafollow = "fa-check";
                         $scope.isFollowing = "Following";
                      }
                  } 
              }



            if($scope.user.typeOfUser == "Producer"){
                $scope.songs = data.songs;
                $scope.artist = data.artist;
                model.mySongs = $scope.songs; 
               $http.get(model.domain + '/getProducerStatistics/' + $scope.userId).success(function(data){
                   //console.log(data);
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
                   drawLocalVsWorldDiagram($scope.songCounters[$scope.selectedSong]);
                   //drawYTlistenersDiagram($scope.songCounters[$scope.selectedSong]);
               });
               $http.get(model.domain + '/getFacebookYoutubeStatistics/' + $scope.userId).success(function(data){ 
                    $scope.views = data.items[0].statistics.viewCount;
                    $scope.subscribers = data.items[0].statistics.subscriberCount;
                    $scope.comments = data.items[0].statistics.commentCount;
               });

            }//end if producer
            
        });//end getUser

       //onYouTubePlayerAPIReady();

  };//end init

$scope.changePie = function(mode){
  $('.mode-btn').removeClass('active');
  if(mode == "pleasure"){
    drawPie($scope.pleasure, $scope.user.profileImage);
     $('#pleasure').addClass('active');
     $scope.globalMode = "P";
     myMode = 1;
  }
  if(mode == "business"){
    drawPie($scope.business, $scope.user.profileImage);
    $('#business').addClass('active');
    $scope.globalMode = "B";
    myMode = 2;
  }
  if(mode == "artist"){
    drawPie($scope.artist.genres, $scope.user.profileImage);
    $('#artist').addClass('active');
    $scope.globalMode = "A";
  }
}
/***********************************************************/
/****************bringMePlaylist FUNCTION*******************/
/***********************************************************/
$scope.bringMePlaylist = function($event){
    if($scope.globalMode == 'A'){
          $scope.playMySongs(0);
    }
    else{
       $scope.track = [];
    $scope.counter = 0;
    $scope.videoFrame3 = false;
    if($scope.videoFrame == false){
        $scope.videoFrame2 = false; 
    }
    if($scope.track.length < 2){
        $scope.thereAreSongsInPlaylist = false;
    }
    else{
         $scope.thereAreSongsInPlaylist = true;
    }
    if($scope.firstTimePlaylist == false){
       $scope.thereAreSongsInPlaylist = false;
    }
     
    $scope.loaderStatus = "visible-loader";
    $scope.loaderStatus2 = "visible-loader";
    // console.log("my select is: " + $scope.data.select);
    var myMode = ($scope.data.select == 'P') ? 1 : 2;
    
    if(typeof $event === 'undefined'){
        var genre =  model.randomGenre;
        $scope.singleORdj = 0;
    }else{
        $scope.singleORdj = 1;
        if(typeof $event.currentTarget === 'undefined'){
          var genre = model.randomGenre;
        }
        else{
          var genre = $event.currentTarget.innerHTML;
          $scope.defaultGenre = genre;
        }
        
    }
         // console.log(genre);
         if($scope.globalMode == "P"){
           myMode = 1;
         }
         else myMode = 2;
         console.log("myMode: " + myMode);
    var url = model.domain + "/getPlaylist/" + $scope.userId + "/" + myMode + "/" + 6 + "/" + genre + "/" + $scope.singleORdj;
         console.log(url);
    $http.get(url).success(function(data){
           console.log("raw data from server:");  
           console.log(data);  

            $scope.thereAreSongsInPlaylist = true;
            $scope.videoFrame3 = true;

            $scope.track = [];
            for(i in data){
                 if(data[i].type == 'producer'){
                  var startUrl = "https://www.youtube.com/watch?v=";
                  //startUrl = startUrl.replace("watch?v=", "embed/"); 
                 
                   $scope.track.push({artistName: data[i].title, songName: data[i].title, url: startUrl+data[i].videoId, songId:data[i].songId, prodId:data[i].prodId, active: 0,type:"p", currGenre : data[i].currGenre});
                 }
                 else{
                   $scope.track.push({artistName: data[i].artistName, songName: data[i].songName, url: data[i].url, active: 0,type:"c", currGenre : data[i].currGenre});
                 }
             }
             console.log("the playlist:");
             console.log($scope.track);
             if($scope.firstTimePlaylist == false){
                 onYouTubePlayerAPIReady();
                 $scope.firstTimePlaylist = true;
             }

            
            $scope.loaderStatus2 = "invisible-loader";
            $scope.nextSong();
            
           
      });
    }
    
    };




/***********************************************************/
/****************SEARCH FUNCTION*******************/
/***********************************************************/
$scope.search = function(text){

activaTab('search');
    
  $http.get(model.domain + '/searchuser/' + text).success(function(data){ 
    $scope.searchResults = [];
    for (i in data){
       $scope.searchResults.push({userID: data[i].userID, firstName : data[i].firstName , lastName: data[i].lastName , username : data[i].username , profileImage : data[i].profileImage , type : data[i].type});
    }
  });
};



$scope.autosearch = function(text){
   
  $http.get(model.domain + '/searchuser/' + text).success(function(data){ 
    $scope.autosearchResults = []; 
    for (i in data){
       $scope.autosearchResults.push({userID: data[i].userID, firstName : data[i].firstName , lastName: data[i].lastName , username : data[i].username , profileImage : data[i].profileImage , type : data[i].type});
    }
  });
};



/***********************************************************/
/****************FOLLOW FUNCTION*******************/
/***********************************************************/
$scope.follow = function(myID, userID){
  if($scope.isFollowing == "Follow"){
    // follow
    $http.get(model.domain + '/addToFollow/' + myID + '/' + userID).success(function(data){ 
      $scope.isFollowing = "Following";
      $scope.fafollow = "fa-check";
      // console.log(data);
    });  
  }else if($scope.isFollowing == "Following"){
    // unfollow
    $http.get(model.domain + '/unfollow/' + myID + '/' + userID).success(function(data){ 
      $scope.isFollowing = "Follow";
      $scope.fafollow = "fa-plus";
      // console.log(data);
    });
  }
};





/***********************************************************/
/****************DRAW DIAGRAM*******************************/
/***********************************************************/
$scope.drawDiagram = function(index){
  //console.log($scope.songCounters[index]);
  //$scope.selectedSong = numberOfSong;
  drawAgeGroupDiagram($scope.songCounters[index]);
  drawLocalVsWorldDiagram($scope.songCounters[index]);
  // activaTab('statistics');
};





/***********************************************************/
/*****************updatePlaylist FUNCTION*******************/
/***********************************************************/
$scope.updatePlaylist = function(genre){
      console.log(genre);
      if(genre == "undefined"){
        genre = $scope.track[$scope.track.length-1].currGenre;
        console.log(genre);
      }

      if($scope.track.length == 1){
          $scope.thereAreSongsInPlaylist = false;
      }
      else{
           $scope.thereAreSongsInPlaylist = true;
      }

      if($scope.firstTimePlaylist == false){
         $scope.thereAreSongsInPlaylist = true;
          if($scope.videoFrame == false){
             $scope.videoFrame2 = false; 
          }
      }
     
       
      $scope.loaderStatus = "visible-loader";
    
      var myMode = ($scope.data.select == 'P') ? 1 : 2;
      
      if(genre === 'undefined'){
        genre = model.randomGenre;
      }

     if($scope.singleORdj == 0 ){
        console.log("no genre, DJ mode on. continue with genre: " + genre);
      }
      else{
            console.log("update playlist with genre: " + genre);
      }
            if($scope.globalMode == "P"){
             myMode = 1;
           }
           else myMode = 2; 
          console.log("myMode: " + myMode);
      var url = model.domain + '/getPlaylist/' + $scope.userId + "/" + myMode + "/" + 6 + "/" + genre + "/" + $scope.singleORdj;
      console.log(url);
      $http.get(url).success(function(data){
           console.log(data);
           $scope.thereAreSongsInPlaylist = true;
           for(i in data){
               if(data[i].type == 'producer'){
                 var startUrl = "https://www.youtube.com/watch?v=";
                  //startUrl = startUrl.replace("watch?v=", "embed/"); 
                 $scope.track.push({artistName: data[i].title, songName: data[i].title, url: startUrl+data[i].videoId, songId:data[i].songId, prodId:data[i].prodId, active: 0,type:"p" , currGenre : data[i].currGenre});
               }
               else{
                 $scope.track.push({artistName: data[i].artistName, songName: data[i].songName, url: data[i].url, active: 0,type:"c" , currGenre : data[i].currGenre});
               }
           }

           console.log("the playlist:");
          console.log($scope.track);
           $scope.videoFrame3 = false;
           $scope.loaderStatus2 = "invisible-loader";

           if($scope.firstTimePlaylist == false){
               onYouTubePlayerAPIReady();
               $scope.nextSong();
          }
         
      });
};





/***********************************************************/
/********************nextSong FUNCTION**********************/
/***********************************************************/
    $scope.nextSong = function(){
         
        //console.log(model.myfavorites);
        if($scope.heart == "fa-heart"){
          $scope.heart = "fa-heart-o";
        }
            if ($scope.counter < $scope.track.length){
              for(p in model.myfavorites){
                if( model.myfavorites[p].url == $scope.track[$scope.counter].url){
                    $scope.heart = "fa-heart";
                }
              }//console.log($scope.track[$scope.counter].url);
              
              if(typeof $scope.track[$scope.counter].url === 'undefined'){
                $scope.counter++;
                $scope.track[$scope.counter - 1].active = 0;
                $scope.track.splice([$scope.counter - 1],1);
                $scope.counter--;
                var myEl = angular.element( document.querySelector( ".repeatClass" + ($scope.counter - 1) ) );
                myEl.remove();
                console.log("$scope.track[$scope.counter].url was undefined - nextSong() was fired");
              }
              var url = $scope.track[$scope.counter].url.replace("watch?v=", "embed/"); 
              url += "?autoplay=0&cc_load_policy=1&showinfo=0&controls=0";
              // console.log(url);
              $scope.myVideo = $sce.trustAsResourceUrl(url);
              player.cueVideoByUrl(url);
              var date = new Date(null);

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

              
            }
            // console.log("track lenght: " + $scope.track.length);
            if($scope.track.length == 5){
                $scope.updatePlaylist($scope.track[$scope.track.length-1].currGenre);
                console.log("list length is 5, call update playlist with genre: " + $scope.track[$scope.track.length-1].currGenre);
            }
            if($scope.track.length == 1){
                $scope.videoFrame3 = true;
                $scope.thereAreSongsInPlaylist = false;
                $scope.loaderStatus2 = "visible-loader";
                // console.log("list length is 1, call update playlist with genre: " + $scope.track[0].currGenre);
                // $scope.updatePlaylist($scope.track[0].currGenre);
            }
            else{
              $scope.thereAreSongsInPlaylist = true;
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
     
       
      if($scope.heart == "fa-heart-o"){
        //add to fav
       
        $scope.heart = "fa-heart";
         if($scope.userId == $scope.myID){
          // $scope.favorits.push({artistName:  $scope.track[$scope.counter - 1].artistName, songName: $scope.track[$scope.counter - 1].songName, duration: "3:43", url: $scope.track[$scope.counter - 1].url});
          model.myfavorites.push({artistName:  $scope.track[$scope.counter - 1].artistName, songName: $scope.track[$scope.counter - 1].songName, duration: $scope.videoDuration, url: $scope.track[$scope.counter - 1].url});   
         }
          var data = JSON.stringify({
                      userId : $scope.myID,
                      songData : {
                         song: $scope.track[$scope.counter - 1].songName,
                         artist: $scope.track[$scope.counter - 1].artistName,
                         duration: $scope.videoDuration,
                         url:  $scope.track[$scope.counter - 1].url
                      }
                 });
            // console.log("fav: " + $scope.track[$scope.counter - 1].songName + " " + $scope.track[$scope.counter - 1].artistName + " " + 1);
            $http.defaults.headers.post["Content-Type"] = "application/json";
            //console.log(model.domain);
            $http.post(model.domain + '/addToFavorites/',data).success(function(data,status){
                 //console.log(data);
                 
                 $scope.elementToFadeInAndOut = "elementToFadeInAndOut";
            });
      }else{
        //remove from fav
        
        $scope.heart = "fa-heart-o";
        //TODO REQUEST TO SERVER TO DELETE THIS SONG FROM FAVORITS
        $http.get(model.domain + '/removeFav/' + $scope.user.userId + '/' + $scope.track[$scope.counter - 1].songName + '/' + $scope.track[$scope.counter - 1].artistName).success(function(data){
              for(i in model.myfavorites){
                
                  if(model.myfavorites[i].url ==  $scope.track[$scope.counter - 1].url){
                       $http.get(model.domain + '/getFavorites/' + $scope.userId).success(function(data){
                            $scope.favorits = [];
                            for(j in data){
                              $scope.favorits.push({artistName: data[j].artist, songName: data[j].song, duration: data[j].duration,url: data[j].url});
                            }
                            model.myfavorites = $scope.favorits; 
                       });
                  }
              }
              
              $scope.elementToFadeInAndOut = "elementToFadeInAndOut";
        });
  
      }
     
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
      $http.post(model.domain + '/addToBlackList/',data).success(function(data,status){
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

  $http.get(model.domain + '/recommandation/' + userId).success(function(data){ 
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



/***********************************************************/
/********************playFavorites FUNCTION**********************/
/***********************************************************/
    $scope.playFavorites = function(url){
        //console.log(url);
        if ( typeof url === 'undefined') {
              if($scope.firstTimePlaylist == false){
                   onYouTubePlayerAPIReady();
                   $scope.firstTimePlaylist = true;
              }
              $scope.track = [];
              angular.forEach(model.myfavorites, function(item){
                  $scope.track.push({artistName: item.artistName, songName: item.songName, url: item.url, active: 0});
              });
              $scope.nextSong();
        }
        else{
              $scope.iCameFromMyPlaylist = true;
             if($scope.firstTimePlaylist == false){
                   onYouTubePlayerAPIReady();
                   $scope.firstTimePlaylist = true;
              }
             $scope.track = [];
             $scope.firstTracks = [];
             $scope.counter = 0;
             var i = 0;
             angular.forEach(model.myfavorites, function(item){
                var flag = (item.url == url) ? 1:0;
                if(item.url == url){
                   $scope.track.push({artistName: item.artistName, songName: item.songName, url: item.url, active: flag});
                }
                else{
                   $scope.firstTracks.push({artistName: item.artistName, songName: item.songName, url: item.url, active: flag});
                }
                 i++;
             });
            
                angular.forEach($scope.firstTracks, function(item){
                    $scope.track.push({artistName: item.artistName, songName: item.songName, url: item.url, active: $scope.firstTracks.flag});
                });
             
             
             $scope.nextSong(); 
        }
        
    };


/***********************************************************/
/********************playThisSong FUNCTION**********************/
/***********************************************************/
    $scope.playThisSong = function(url){
         //console.log(model.myfavorites);
        
        $scope.iCameFromMyPlaylist = true;
         if($scope.firstTimePlaylist == false){
               onYouTubePlayerAPIReady();
               $scope.firstTimePlaylist = true;
          }
         $scope.tempTrack = $scope.track;
         $scope.track = [];
         $scope.firstTracks = [];
         $scope.counter = 0;
         var i = 0;
         angular.forEach($scope.tempTrack, function(item){
            var flag = (item.url == url) ? 1:0;
            if(item.url == url){
               $scope.track.push({artistName: item.artistName, songName: item.songName, url: item.url, active: flag});
            }
            else{
               $scope.firstTracks.push({artistName: item.artistName, songName: item.songName, url: item.url, active: flag});
            }
             i++;
         });
        
            angular.forEach($scope.firstTracks, function(item){
                $scope.track.push({artistName: item.artistName, songName: item.songName, url: item.url, active: $scope.firstTracks.flag});
            });
         
         
         $scope.nextSong(); 
    };



/***********************************************************/
/********************playMySongs FUNCTION**********************/
/***********************************************************/
    $scope.playMySongs = function(index){
         //console.log(model.mySongs);

         $scope.iCameFromMyPlaylist = true;
         if($scope.firstTimePlaylist == false){
               onYouTubePlayerAPIReady();
               $scope.firstTimePlaylist = true;
          }
         $scope.track = [];
          $scope.firstTracks = [];
         $scope.counter = 0;
         var i = 0;
         angular.forEach(model.mySongs, function(item){
             var flag = (i == index) ? 1:0;
             var url = "https://www.youtube.com/watch?v=" + item.videoId;
             if(i>=index){
               $scope.track.push({artistName: item.title, songName: item.title, url: url, active: flag});
             }
             else{
               $scope.firstTracks.push({artistName: item.title, songName: item.title, url: url, active: flag});
             }
             //$scope.track.push({artistName: item.artistName, songName: item.songName, url: item.url, active: flag});
             i++;
         });
         angular.forEach($scope.firstTracks, function(item){
               $scope.track.push({artistName: item.artistName, songName: item.songName, url: item.url, active: $scope.firstTracks.flag});
         });
         $scope.nextSong(); 
    };



/***********************************************************/
/********************updateCounters FUNCTION**********************/
/***********************************************************/
    $scope.updateCounters = function(){
        //console.log("updateCounters function" );
         if($scope.track[0].type == "p"){
            $http.get("http://localhost:3000/updateCounters/" + $scope.prodId + "/" + $scope.track.songId + "/" + $scope.myID).success(function(data){
                console.log("updateCounters successfuly");
            });
         }
         
    };




/***********************************************************/
/********************goToAboutPage FUNCTION*****************/
/***********************************************************/
    $scope.goToAboutPage = function(){
       $('.tab-pane').removeClass('active');
       $('#about').addClass('active');
       $('#about').addClass('in');
       $('#myTab li').removeClass('active');
    };

/***********************************************************/
/********************goToHelpPage FUNCTION******************/
/***********************************************************/
    $scope.goToHelpPage = function(){
       $('.tab-pane').removeClass('active');
       $('#help').addClass('active');
       $('#help').addClass('in');
       $('#myTab li').removeClass('active');
    };

/***********************************************************/
/********************goToDeveloperPage FUNCTION*************/
/***********************************************************/
    $scope.goToDeveloperPage = function(){
       $('.tab-pane').removeClass('active');
       $('#developer').addClass('active');
       $('#developer').addClass('in');
       $('#myTab li').removeClass('active');
    };

/***********************************************************/
/********************goToMobilePage FUNCTION****************/
/***********************************************************/
    $scope.goToMobilePage = function(){
       $('.tab-pane').removeClass('active');
       $('#mobile').addClass('active');
       $('#mobile').addClass('in');
       $('#myTab li').removeClass('active');
    };

/***********************************************************/
/********************goToActivityPage FUNCTION**************/
/***********************************************************/
    $scope.goToActivityPage = function(){
       $('.tab-pane').removeClass('active');
       $('#activity').addClass('active');
       $('#activity').addClass('in');
       $('#myTab li').removeClass('active');
    };



/***********************************************************/
/*************removeItem from playlist FUNCTION*************/
/***********************************************************/
   $scope.removeItem = function(url){
     for(i in model.myfavorites){
       if(model.myfavorites[i].url == url){
          $http.get(model.domain + '/removeFav/' + $scope.user.userId + '/' + model.myfavorites[i].songName + '/' + model.myfavorites[i].artistName).success(function(data){
                 if(url ==  $scope.track[$scope.counter - 1].url){
                     $scope.heart = "fa-heart-o";
                 }
                delete model.myfavorites; 

               $http.get(model.domain + '/getFavorites/' + $scope.userId).success(function(data){
                    $scope.favorits = [];
                    for(j in data){
                      $scope.favorits.push({artistName: data[j].artist, songName: data[j].song, duration: data[j].duration,url: data[j].url});
                    }
                    model.myfavorites = $scope.favorits; 
               });
          });
           
       }
      
     }
           
   }



/***********************************************************/
/*************genealLoader FUNCTION*************/
/***********************************************************/
   $scope.generalLoader = function(whereICameFrom){
        $scope.generalLoader = whereICameFrom;
   }


/***********************************************************/
/*************moveToThisPoint FUNCTION*************/
/***********************************************************/
   $scope.moveToThisPoint = function($event){
        var totalWidth = $(".navTimerContainer").css('width');
        totalWidth = totalWidth.replace("px",'');
        var youtubeTime = ($event.offsetX / totalWidth).toFixed(2);
        var result = youtubeTime * player.getDuration();
        player.seekTo(result);
   }
/***********************************************************/
/*************fullScreen FUNCTION*************/
/***********************************************************/
   $scope.fullScreen = function(){

          $("iframe").addClass("fullScreenVideoStyle");
          $("body").addClass("BodyFullScreenStyle");
          $(".video-close-hide").addClass("video-close");
          $(".navbar-static-top").addClass("video-close-hide");
   }



/***********************************************************/
/*************closeFullScreen FUNCTION*************/
/***********************************************************/
   $scope.closeFullScreen = function(){
          $("iframe").removeClass("fullScreenVideoStyle");
          $("body").removeClass("BodyFullScreenStyle");
          $(".video-close-hide").removeClass("video-close");
          $(".navbar-static-top").removeClass("video-close-hide");
   }



/***********************************************************/
/*************showCounters FUNCTION*************/
/***********************************************************/
   $scope.showCounters = function(){
      if($scope.firstTimeStatistics){
        $scope.firstTimeStatistics = false;
         views = $scope.views;
         sub = $scope.subscribers;
         com = $scope.comments;
         $scope.views = 0;
         $scope.subscribers = 0;
         $scope.comments = 0;
         $interval(ticktick1, $scope.ticktickInterval);
      }
         
   }



});

// https://www.googleapis.com/youtube/v3/videos?id=9bZkp7q19f0&part=contentDetails&key=AIzaSyAj8gdaFuSOQ2nBnBh1ShUVRsuhxoWFsXk

