angular.module('fitness.rankings', [])

.controller('RankCtrl', function($scope, gameService, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  var self = this ;

  $scope.$on('$ionicView.enter', function(e) {

    gameService.getFitbitData();
    
    self.data = {} ;
    self.data.summary = gameService.data.summary;
  });


  this.refreshData = function(){

		gameService.getFitbitData();
		$scope.$broadcast('scroll.refreshComplete');
	}
})
