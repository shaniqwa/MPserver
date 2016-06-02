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


angular.module('profile',['datatables'])
.controller('profileCtrl', function ($scope, $http, $sce, $interval, DTOptionsBuilder) {

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
   $scope.firstTracks = [];
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
   $scope.tickInterval = 1000 //ms
   $scope.timeWidth;
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
        
        $scope.$apply(function() {
          $scope.videoFrame = true;
          $scope.videoFrame2 = true;
          $scope.videoFrame3 = true;
          $scope.loaderStatus = "invisible-loader";
        });
    }


 

    // when video ends
     function onPlayerStateChange(event) {  

        if(event.data === 0) {    //video ended
            
            var next = angular.element( document.querySelector(".fa-fast-forward") );
            next.triggerHandler('click');

        }
        if(event.data === 1){   //video playing
          $scope.$apply(function() {
            $interval(tick, $scope.tickInterval);
            
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
          
        }
         if(event.data === 3){  //video buffering
          
        }
         if(event.data === 5){  //video cued
          
        }
       
    }

       
      var tick = function(){
       //$scope.timer = new Date(player.getCurrentTime() * 1000).toISOString().substr(11, 8);

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


       var tempTimer = player.getCurrentTime() / player.getDuration();
       $scope.timeWidth = tempTimer * 100;
       //console.log($scope.timeWidth);
      }
      
/***********************************************************/
/***************INIT FUNCTION - ON LOAD PAGE****************/
/***********************************************************/
  $scope.init = function(userID){
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
                     // console.log(model.randomGenre);
              }
            }



            drawPie($scope.pleasure, $scope.user.profileImage);
            activaTab('profile');

            // get user's favorits
            $http.get(model.domain + '/getFavorites/' + $scope.userId).success(function(data){
                $scope.favorits = [];
                for(i in data){
                  $scope.favorits.push({artistName: data[i].artist, songName: data[i].song, duration: data[i].duration,url: data[i].url});
                }
                model.myfavorites = $scope.favorits; 
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
                   
               });
               $http.get(model.domain + '/getFacebookYoutubeStatistics/' + $scope.userId).success(function(data){
                    //console.log(data); 
                   //drawYTlistenersDiagram($scope.songCounters[$scope.selectedSong]);
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
        var genre =  model.randomGenre;
    }
    else{
        if(typeof $event.currentTarget === 'undefined'){
          var genre = model.randomGenre;
        }
        else{
          var genre = $event.currentTarget.innerHTML;
          $scope.defaultGenre = genre;
        }
        
    }
         // console.log(genre);
    var url = model.domain + "/getPlaylist/" + $scope.user.userId + "/" + myMode + "/" + 6 + "/" + genre;
         //console.log(url);
    $http.get(model.domain + '/getPlaylist/' + $scope.user.userId + '/' + myMode + '/' + 6 + '/' + genre).success(function(data){
           // console.log(data);
       
            $scope.videoFrame3 = true;

             for(i in data){
                 if(data[i].type == 'producer'){
                  var startUrl = "https://www.youtube.com/watch?v=";
                  //startUrl = startUrl.replace("watch?v=", "embed/"); 
                 
                   $scope.track.push({artistName: data[i].title, songName: data[i].title, url: startUrl+data[i].videoId, songId:data[i].songId, prodId:data[i].prodId, active: 0,type:"p"});
                 }
                 else{
                   $scope.track.push({artistName: data[i].artistName, songName: data[i].songName, url: data[i].url, active: 0,type:"c"});
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
  $http.get(model.domain + '/searchuser/' + text).success(function(data){ 
    for (i in data){
       $scope.searchResults.push({userID: data[i].userID, firstName : data[i].firstName , lastName: data[i].lastName , username : data[i].username , profileImage : data[i].profileImage , type : data[i].type});
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
      console.log(data);
    });  
  }else if($scope.isFollowing == "Following"){
    // unfollow
    $http.get(model.domain + '/unfollow/' + myID + '/' + userID).success(function(data){ 
      $scope.isFollowing = "Follow";
      $scope.fafollow = "fa-plus";
      console.log(data);
    });
  }
};





/***********************************************************/
/****************DRAW DIAGRAM*******************************/
/***********************************************************/
$scope.drawDiagram = function(index){
  console.log($scope.songCounters[index]);
  //$scope.selectedSong = numberOfSong;
  drawAgeGroupDiagram($scope.songCounters[index]);
  drawLocalVsWorldDiagram($scope.songCounters[index]);
  // activaTab('statistics');
};





/***********************************************************/
/*****************updatePlaylist FUNCTION*******************/
/***********************************************************/
    $scope.updatePlaylist = function($event){
     //$scope.track = [];
     //$scope.counter = 0;
    //$scope.videoFrame3 = false;
    if($scope.videoFrame == false){
        $scope.videoFrame2 = false; 
    }
     
    $scope.loaderStatus = "visible-loader";
    //$scope.loaderStatus2 = "visible-loader";
    // console.log("my select is: " + $scope.data.select);
    var myMode = ($scope.data.select == 'P') ? 1 : 2;

         if(typeof $event === 'undefined'){
            var genre =  model.randomGenre;
          }
          else{
               if(typeof $event.currentTarget === 'undefined'){
                  var genre = model.randomGenre;
               }
               else{
                var genre = $event.currentTarget.innerHTML;
                $scope.defaultGenre = genre;
              }
          }
            
           
         // console.log(genre);
         var url = model.domain + '/getPlaylist/' + $scope.user.userId + "/" + myMode + "/" + 6 + "/" + genre;
          //console.log(url);
         $http.get(model.domain + '/getPlaylist/' + $scope.user.userId + '/' + myMode + '/' + 6 + '/' + genre).success(function(data){
            console.log(data);
           for(i in data){
               if(data[i].type == 'producer'){
                 var startUrl = "https://www.youtube.com/watch?v=";
                  //startUrl = startUrl.replace("watch?v=", "embed/"); 
                 $scope.track.push({artistName: data[i].title, songName: data[i].title, url: startUrl+data[i].videoId, songId:data[i].songId, prodId:data[i].prodId, active: 0,type:"p"});
               }
               else{
                 $scope.track.push({artistName: data[i].artistName, songName: data[i].songName, url: data[i].url, active: 0,type:"c"});
               }
           }
           $scope.videoFrame3 = false;
           $scope.loaderStatus2 = "invisible-loader";
           if($scope.firstTimePlaylist == false){
               onYouTubePlayerAPIReady();
               $scope.firstTimePlaylist = true;
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
               //$scope.updatePlaylist();
              
            }
            console.log("track lenght: " + $scope.track.length);
            if($scope.track.length == 5){
                $scope.updatePlaylist();
            }
            if($scope.track.length == 1){
                $scope.videoFrame3 = true;
                $scope.loaderStatus2 = "visible-loader";
                $scope.updatePlaylist();
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
          model.myfavorites.push({artistName:  $scope.track[$scope.counter - 1].artistName, songName: $scope.track[$scope.counter - 1].songName, duration: "3:43", url: $scope.track[$scope.counter - 1].url});   
         }
          var data = JSON.stringify({
                      userId : $scope.myID,
                      songData : {
                         song: $scope.track[$scope.counter - 1].songName,
                         artist: $scope.track[$scope.counter - 1].artistName,
                         duration: "3:43",
                         url:  $scope.track[$scope.counter - 1].url
                      }
                 });
            // console.log("fav: " + $scope.track[$scope.counter - 1].songName + " " + $scope.track[$scope.counter - 1].artistName + " " + 1);
            $http.defaults.headers.post["Content-Type"] = "application/json";
            //console.log(model.domain);
            $http.post(model.domain + '/addToFavorites/',data).success(function(data,status){
                 //console.log(data);
                 $scope.msg = $scope.track[$scope.counter - 1].songName + " added successfuly to your Favorites";
                 $scope.elementToFadeInAndOut = "elementToFadeInAndOut";
            });
      }else{
        //remove from fav
        $scope.heart = "fa-heart-o";
        //TODO REQUEST TO SERVER TO DELETE THIS SONG FROM FAVORITS
        $http.get(model.domain + '/removeFav/' + $scope.user.userId + '/' + $scope.track[$scope.counter - 1].songName + '/' + $scope.track[$scope.counter - 1].artistName).success(function(data){
              for(i in model.myfavorites){
                
                  if(model.myfavorites[i].url ==  $scope.track[$scope.counter - 1].url){
                    delete model.myfavorites[i]; 
                    delete $scope.track[$scope.counter - 1];
                    $(".songItem" + i).empty();
                  }
              }
              $scope.msg = $scope.track[$scope.counter - 1].songName + " removed successfuly from your Favorites";
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
    $scope.playFavorites = function(index){
         //console.log(model.myfavorites);
         
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
             var flag = (i == index) ? 1:0;
             //console.log(item.url);
             if(i>=index){
               $scope.track.push({artistName: item.artistName, songName: item.songName, url: item.url, active: flag});
             }
             else{
                $scope.firstTracks.push({artistName: item.artistName, songName: item.songName, url: item.url, active: flag});
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
               $scope.firstTracks.push({artistName: item.artistName, songName: item.songName, url: url, active: flag});
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
        console.log("updateCounters function" );
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



});


// get song duration from youtube
// https://www.googleapis.com/youtube/v3/videos?id=9bZkp7q19f0&part=contentDetails&key=AIzaSyAj8gdaFuSOQ2nBnBh1ShUVRsuhxoWFsXk

