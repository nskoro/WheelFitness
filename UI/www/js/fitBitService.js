app.service('fitBitService', function($http, $q, $cordovaOauthUtility){

    /*
     * Sign into the fitBit service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    this.oauthfitBit = function(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
      //  if($cordovaOauthUtility.isInAppBrowserInstalled()) {
      if (true){
          var redirect_uri = "https://tinyurl.com/4g70";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
             // redirect_uri = options.redirect_uri;
            }
          }
          var flowUrl = "https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=228BM4&redirect_uri=https%3A%2F%2Ftinyurl.com%2F4g70&expires_in=31536000&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight";
         
          var browserRef = window.cordova.InAppBrowser.open(flowUrl, '_blank');
          browserRef.addEventListener('loadstart', function(event) {
          if (event.url.indexOf("https://www.fitbit.com")> -1){
            console.log('auth is open');
          }
          else if(event.url.indexOf(redirect_uri) > -1){
              console.log('got to the redirect');
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();
              var callbackResponse = (event.url).split("#")[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = [];
              for(var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }
              console.log(JSON.stringify(parameterMap));
             
              if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                console.log('got to resolve');
                deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in });
              } else {
                if ((event.url).indexOf("error_code=100") !== 0) {
                  deferred.reject("fitBit returned error_code=100: Invalid permissions");
                } else {
                  deferred.reject("Problem authenticating");
                }
              }
            }
            else{ // unrecognized redirect
                console.log('redirect url is different ' + event.url);
                 browserRef.removeEventListener("exit",function(event){});
                 browserRef.close();
            }
          });
          browserRef.addEventListener('exit', function(event) {
            deferred.reject("The sign in flow was canceled");
          });
        } else {
          deferred.reject("Could not find InAppBrowser plugin");
        }
      } else {
        deferred.reject("Cannot authenticate via a web browser");
      }
      return deferred.promise;
    }

  }); 