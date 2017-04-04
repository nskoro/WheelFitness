// Game logic service
app.service('gameService', function($http) {

 console.log('game service loaded!');
 var self = this;

 // sample variables
 this.player = {} ;
 this.phrase = {} ;
 this.player.steps = {} ;
 this.player.flights = {} ;

 this.data = {} ;

 this.data.steps = 300 ;
 this.data.floors = 30 ;
 this.data.time = 24 ;
 this.data.goals = {};
 this.data.goals.steps = 0;

this.updateTime = function(time){
    this.data.time = time ;

    return time ;
}
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
              url: 'https://api.fitbit.com/1/user/-/activities/date/today.json'
            }).then(function successCallback(response) {
                
                console.log(JSON.stringify(response));

                self.data.steps = response.data.summary.steps ;
                self.data.floors = response.data.summary.floors ;

                self.data.goals = response.data.goals ;
                var date = new Date();
                self.data.time =  24 - date.getHours(); 
                console.log('steps are: ' + self.data.steps);
                console.log('floors are: ' + self.data.floors);

            },function errorCallback(response) {
                console.log(response.statusText);
                if ( response.statusText != "Too Many Requests")
                   self.reload();
            });
  }

  this.reload = function(){
      window.location.replace('http://localhost:8100');
  }

  this.logout = function(){
      var logoutToken = btoa('228D84:8344dafa189daab385897122cb0c87b3');
    
      console.log(logoutToken);

        $http.defaults.headers.common['Authorization'] = 'Basic ' + logoutToken;
        $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
        

        $http({
              method: 'POST',
              url: 'https://api.fitbit.com/oauth2/revoke?token='+self.fitbitToken
            }).then(function successCallback(response) {
                
                console.log(JSON.stringify(response));  
               // self.reload();
               window.location.replace('https://www.fitbit.com/logout?disableThirdPartyLogin=true&redirect=%2Foauth2%2Fauthorize%3Fclient_id%3D228D84%26expires_in%3D31536000%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%253A8100%26response_type%3Dtoken%26scope%3Dactivity%2Bnutrition%2Bheartrate%2Blocation%2Bnutrition%2Bprofile%2Bsettings%2Bsleep%2Bsocial%2Bweight%26state&requestCredentials=true');
            },function errorCallback(response) {
                console.log(JSON.stringify(response));
               
            });

  }
});