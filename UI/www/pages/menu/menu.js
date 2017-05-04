angular.module('fitness.menu', [])

.controller('AppCtrl', function($scope, gameService, $ionicPopup, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  this.logout = function(){
    	$ionicPopup.confirm({
	     title: 'Logout',
	     template: 'Are you sure you want to logout? Current game progress will be lost.',
		 okText: 'Logout'
	   }).then(function(res) {
	   	if(res) {
         	localforage.removeItem("gameState");	     
		      gameService.activeGame = false;
	      	gameService.clearGame();
	   		  gameService.logout();
	   	} else {
	   		// do nothing
	   	}
	   });
  }
})
