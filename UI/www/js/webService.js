// SERVICE FOR DATA COMMUNICATION WITH THE fitbit SERVER
app.service('webService', function($http, $ionicModal, $interval, $timeout, $state, $q, $window) {

 // put all the fitbit http requests here
  this.phrases = [{ id: '1',
                    category: 'nature',
                    phrase: 'here goes the phrase',
                    difficulty: '1' },
                  { id: '2',
                    category: 'nature',
                    phrase: 'here goes another phrase',
                    difficulty: '5' }, // out of 10
                 ];
})
