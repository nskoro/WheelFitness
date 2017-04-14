angular.module('fitness.home', [])

.controller('HomeCtrl', function($scope, gameService, $state, $ionicModal, $ionicPopup, $timeout, $http) {

    var self = this ;

    this.data = {} ;
    this.data.activeGame = false ;
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
    
    	localforage.getItem("gameState").then(function(savedState) {
			if (savedState){
                    self.data.activeGame = true ;
                }
                else    
                     self.data.activeGame = false ;
            });
      
      self.fitbitData = gameService.data ;
      console.log('setting active game flag to : ' + self.data.activeGame);
      var fitbitToken = window.fitbitAccessToken;

      if (fitbitToken){
         localforage.setItem('fitbitToken', fitbitToken);
         gameService.fitbitToken = fitbitToken;
      }
      else{
        console.log('getting access token from storage');
		localforage.getItem('fitbitToken').then(function(token){
			if (!token)
			    gameService.reload();
       
			gameService.fitbitToken = token;
            fitbitToken = token ;
			console.log('saving token to game service: ' + token);
		});
      }

      gameService.getFitbitData();

  
  });

  this.loadNewGame = function(length){

      $state.go('app.game');

      if(gameService.data.rightAnswers == 0) // only if user never won
        $ionicPopup.alert({
                title: 'Game Tip',
                template: 'Make sure your FitBit is set to "All-Day Sync" for best performance. <br /><br />Open the FitBit app, go to dashboard, and select your device. Then scroll down and enable "All-Day Sync". <br /><br /> FitBit will sync every twenty minutes or so if there are new steps made.'
        });
   }

  this.continueGame = function(){

        $state.go('app.game');
      
  }
});