// Game logic service
app.service('gameService', function($http) {

 var self = this;

 // sample variables
 this.player = {} ;
 this.phrase = {} ;
 this.player.steps = {} ;
 this.player.flights = {} ;

// define game logic here
    this.sampleFunction = function(){

        return 0 ;
    }

  this.getFitbitData = function(){
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + self.fitbitToken;
        $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

      console.log('token' + self.fitbitToken);
      
      $http({
              method: 'GET',
              url: 'https://api.fitbit.com/1/user/-/activities/steps/date/today/1m.json'
            }).then(function successCallback(response) {
                
                console.log(JSON.stringify(response));
                self.steps = response ;

            },function errorCallback(response) {
                console.log(response.statusText);
                window.location.replace('http://localhost:8100');
            });
  }
   
});