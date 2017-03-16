// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'fitness.splash','fitness.home','fitness.login','fitness.menu', 'fitness.settings', 'fitness.rankings'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'pages/menu/menu.html',
      controller: 'AppCtrl as appCtrl'
  })
  .state('splash', {
      url: '/splash',
      templateUrl: 'pages/splash/splash.html',
      controller: 'SplashCtrl as splashCtrl'
    })

   .state('login', {
      url: '/login',
        templateUrl: 'pages/login/login.html',
        controller: 'LoginCtrl as loginCtrl'
    })
  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'pages/home/home.html',
        controller: 'HomeCtrl as homeCtrl'
      }
    }
  })
  .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'pages/settings/settings.html',
          controller: 'SettingsCtrl as settingsCtrl'
        }
      }
    })
    .state('app.rankings', {
      url: '/rankings',
      views: {
        'menuContent': {
          templateUrl: 'pages/rankings/rankings.html',
          controller: 'RankCtrl as rankCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  console.log(window.location.hash);
  var fitbitAccessToken;

  console.log(window.location.hash);

  if (!window.location.hash) {
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
      console.log('accessToken is : ' + fitbitAccessToken );

      $urlRouterProvider.otherwise('/splash');
  }
  
});
