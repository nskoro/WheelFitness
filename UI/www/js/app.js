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
  alert(window.location.hash);
  
  $urlRouterProvider.otherwise('/splash');
});
