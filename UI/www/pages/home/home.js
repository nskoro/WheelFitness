angular.module('fitness.home', [])

.controller('HomeCtrl', function($scope, $ionicModal, $timeout, $http) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  $scope.$on('$ionicView.enter', function(e) {
  
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

      $http.defaults.headers.common['Authorization'] = 'Bearer ' + window.fitbitAccessToken;
      $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

      console.log('token' + window.fitbitAccessToken);
      
      $http({
              method: 'GET',
              url: 'https://api.fitbit.com/1/user/-/activities/steps/date/today/1m.json'
            }).then(function successCallback(response) {
                alert(JSON.stringify(response));

            });
  });

  
})
