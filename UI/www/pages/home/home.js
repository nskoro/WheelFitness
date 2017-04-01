angular.module('fitness.home', [])

.controller('HomeCtrl', function($scope, gameService, $state, $ionicModal, $timeout, $http) {

    var self = this ;

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  $scope.$on('$ionicView.enter', function(e) {
      console.log('home ctrl');
  
    //https://api.fitbit.com/1/user/-/activities/steps/date/today/1m.json
    /*
     'https://api.fitbit.com/1/user/-/activities/heart/date/2016-03-19/1d/1sec/time/21:00/23:00.json',
    {
        headers: new Headers({
            'Authorization': 'Bearer ' + fitbitAccessToken
        }),
        mode: 'cors',
        method: 'GET'
    }*/
    
      var fitbitToken = window.fitbitAccessToken;

      if (fitbitToken){
         localforage.setItem('fitbitToken', fitbitToken);
         gameService.fitbitToken = fitbitToken;
      }
      else{
        console.log('getting access token from storage');
		localforage.getItem('fitbitToken').then(function(token){
			if (!token)
			    window.location.replace('http://localhost:8100');
       
			gameService.fitbitToken = token;
            fitbitToken = token ;
			console.log('saving token to game service: ' + token);
		});
      }

      gameService.getFitbitData();

  
  });

  this.loadNewGame = function(length){

      $state.go('app.game');
  }

  
})
