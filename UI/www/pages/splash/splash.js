angular.module('fitness.splash', [])

.controller('SplashCtrl', function($scope, $ionicModal, $timeout, $state, fitBitService) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

 console.log(window.location.hash);

 var self = this ;

 this.startOauth = function(){

  fitBitService.oauthfitBit('228D84', ["email"], {redirect_uri: ''})

            .then(function(result){
        
                var access_token = result.access_token;
                console.log('FITIBT LOGIN FINISHED' + access_token);
                window.fitbitAccessToken = access_token ;
                $state.go('app.home');
        },
          function(error){
                console.log("Fitbit Login Error: " + error);
        });
  }


  //$state.go('app.home');
  $scope.$on('$ionicView.enter', function(e) {

     self.startOauth();

    });

 });