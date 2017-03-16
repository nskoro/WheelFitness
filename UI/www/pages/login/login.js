angular.module('fitness.login', [])

.controller('LoginCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  console.log('login controller loaded');
  // If user hasn't authed with Fitbit, redirect to Fitbit OAuth Implicit Grant Flow
var fitbitAccessToken;

console.log(window.location.hash);

if (window.location.hash == '#/login') {
     console.log('loading fitbit auth');
     window.location.replace('https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=228D84&redirect_uri=http%3A%2F%2Flocalhost%3A8100&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight');
} else {
  //http%3A%2F%2Flocalhost%3A8100
    console.log('loading access token');
    var fragmentQueryParameters = {};
    window.location.hash.slice(1).replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { fragmentQueryParameters[$1] = $3; }
    );

    fitbitAccessToken = fragmentQueryParameters.access_token;
}

})
