var profile = angular.module('profile',[]);

profile.controller('profileCtrl', function ($scope, $http) {
	$scope.getSong = function($event){
       var genre = $event.currentTarget.innerHTML;
        console.log($event.currentTarget.innerHTML);
        // $http.get('').success(function(data){
        //   console.log(data);
        // });
    };
});

