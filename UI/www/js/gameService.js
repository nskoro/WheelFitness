// Game logic service
app.service('gameService', function($http, $q) {

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
 this.vowels = ['A', 'E', 'I', 'O', 'U'];
 this.activeGame = false ;
 this.data.penaltySteps = 0 ;
 this.data.penaltyFloors = 0 ;

 this.data.preExistingFloors = 0;
 this.data.preExistingSteps = 0;

 localforage.getItem("wrongAnswers").then(function(result){
      if (result)
        self.data.wrongAnswers = Number(result);
      else self.data.wrongAnswers = 0 ;
 });


 localforage.getItem("rightAnswers").then(function(result){
      if (result)
        self.data.rightAnswers = Number(result);
      else self.data.rightAnswers = 0 ;
 });

  localforage.getItem("totalPenalty").then(function(result){
    console.log('total steps from memory ' + result);
      if (result)
        self.data.penaltySteps = result ;
  });

    localforage.getItem("totalPenaltyFloors").then(function(result){
      if (result)
        self.data.penaltyFloors = result ;
  });

  localforage.getItem("preExistingSteps").then(function(result){
    console.log('previous steps from memory ' + result);
      if (result)
        self.data.preExistingSteps = result ;
  });

    localforage.getItem("preExistingFloors").then(function(result){
      if (result)
        self.data.preExistingFloors = result ;
  });
   
 this.startGame = function() {
  var index = self.getRandomInt(0, self.dataArray.length);
  var phraseData = self.dataArray[index];
  var numVowels = 0;
  var numCons = 0;
  var phrase = phraseData["Phrase"].toUpperCase();
  var noSpace = phraseData["Phrase Without Spaces"].toUpperCase();

  for(var i = 0; i < phrase.length; i++) {
     // don't care if it's a space
     if(phrase.charAt(i) === " ") {
       continue;
     } 
     // increment vowel count
     else if(self.vowels.includes(phrase.charAt(i))) {
       numVowels++;
     }
     // increment consonant count
     else {
       numCons++;
     }
  }

  console.info("MY VOWELS: "+numVowels + " THEIR VOWELS: " + phraseData["Vowels Count"])
  console.info("MY CONS: "+numCons + " THEIR CONS: " + phraseData["Consonants Count"])

  var orderVowels = [];
  for(var a = 0; a < numVowels; a++) {
    orderVowels[a] = a;
  }

  var orderCons = [];
  for(var b = 0; b < numCons; b++) {
    orderCons[b] = b;
  }

  var orderVowels = self.shuffleArray(orderVowels);
  var orderCons = self.shuffleArray(orderCons);

  var vowelStack = new Array(numVowels);
  var consStack = new Array(numCons);

  var parts = phrase.split(" ");
  var viewModel = [];
  parts.forEach(function(d) {
    var temp = [];
    for(var x = 0; x < d.length; x++) {
      var obj = {
        letter: d[x],
        revealed: false,
        model: "."
      };

      if(self.vowels.includes(d[x])) {
        obj.letterType = "V";
        obj.order = orderVowels.shift();
        vowelStack[obj.order] = obj;
      } else if(d === ' ') {
        obj.letterType = "S";
      } else {
        obj.letterType = "C";
        obj.order = orderCons.shift();
        consStack[obj.order] = obj;
      }
      temp.push(obj);
    }
    viewModel.push(temp)
  });

  //self.data.penaltySteps = self.data.penaltySteps + self.data.steps ;
 // self.data.penaltyFloors = self.data.penaltyFloors + self.data.floors;

  self.data.preExistingSteps = self.data.summary.steps;
  self.data.preExistingFloors = self.data.summary.floors;

  self.data.steps = 0 ;
  self.data.floors = 0 ;

  localforage.setItem("totalPenalty", self.data.penaltySteps);
  localforage.setItem('totalPenaltyFloors', self.data.penaltyFloors );
  localforage.setItem("preExistingSteps", self.data.preExistingSteps);
  localforage.setItem('preExistingFloors', self.data.preExistingFloors );

  return {
    numVowels: numVowels,
    numCons: numCons,
    phrase: phrase,
    noSpace: noSpace,
    vowelStack: vowelStack,
    consStack: consStack,
    viewModel: viewModel,
    hint: phraseData["Hint"]
  };
};

self.getRandomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// stole this from http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
self.shuffleArray = function(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
}

this.updateTime = function(time){
    this.data.time = time ;

    return time ;
}
// define game logic here
    this.sampleFunction = function(){

        return 0 ;
    }

  this.getFitbitData = function(){

         var deferred = $q.defer();

        $http.defaults.headers.common['Authorization'] = 'Bearer ' + self.fitbitToken;
        $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

      console.log('token' + self.fitbitToken);
      
      $http({
              method: 'GET',
              url: 'https://api.fitbit.com/1/user/-/activities/date/today.json'
            }).then(function successCallback(response) {

                // HACK FOR OLDER FITBITS WITHOUT FLOOR SUPPORT
                if (!response.data.summary.floors)
                  response.data.summary.floors = 0 ;
                
                console.log(JSON.stringify(response));
                console.log('pre existing steps are ' + self.data.preExistingSteps);
                self.data.steps = response.data.summary.steps - self.data.preExistingSteps ;
                self.data.floors = response.data.summary.floors - self.data.preExistingFloors ;
                self.data.summary = response.data.summary ;

                if ( self.data.steps < 0)
                  self.data.steps = response.data.summary.steps ;
                if (self.data.floors < 0)
                  self.data.floors = response.data.summary.floors ;

                self.data.goals = response.data.goals ;

                if ( self.data.penaltySteps == 0 ){
                   //   self.data.penaltySteps = self.data.goals.steps ;
                  //    self.data.penaltyFloors = self.data.goals.floors ;
                }

               // self.data.steps = 800 ;
               // self.data.floors = 25;
                
                var date = new Date();
                self.data.time =  date.getHours(); 
                console.log('steps are: ' + self.data.steps);
                console.log('floors are: ' + self.data.floors);

                deferred.resolve(response);

            },function errorCallback(response) {
                console.log(response.statusText);
                 deferred.reject(response);
                if ( response.statusText != "Too Many Requests")
                   self.reload();
            });

          return deferred.promise;
  }

  this.reload = function(){
      // local
     if (!window.cordova)
        window.location.replace('http://localhost:8100');
      
      //production
      //window.location.replace('https://wheelfitness.herokuapp.com');
      
      $state.reload();

  }

  this.logout = function(){

     // localhost
      var logoutToken = btoa('228D84:8344dafa189daab385897122cb0c87b3');

      // production
      //var logoutToken = btoa('2288CR:09483413912c11d2805142a79d3bd835');
    
      console.log(logoutToken);

        $http.defaults.headers.common['Authorization'] = 'Basic ' + logoutToken;
        $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

        $http({
              method: 'POST',
              url: 'https://api.fitbit.com/oauth2/revoke?token='+self.fitbitToken
            }).then(function successCallback(response) {
                
                console.log(JSON.stringify(response));  
               // production      
               //window.location.replace('https://www.fitbit.com/logout?disableThirdPartyLogin=true&redirect=%2Foauth2%2Fauthorize%3Fclient_id%3D2288CR%26expires_in%3D31536000%26redirect_uri%3Dhttps%253A%252F%252Fwheelfitness.herokuapp.com%26response_type%3Dtoken%26scope%3Dactivity%2Bnutrition%2Bheartrate%2Blocation%2Bnutrition%2Bprofile%2Bsettings%2Bsleep%2Bsocial%2Bweight%26state&requestCredentials=true');
       
               // local
               window.location.replace('https://www.fitbit.com/logout?disableThirdPartyLogin=true&redirect=%2Foauth2%2Fauthorize%3Fclient_id%3D228D84%26expires_in%3D31536000%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%253A8100%26response_type%3Dtoken%26scope%3Dactivity%2Bnutrition%2Bheartrate%2Blocation%2Bnutrition%2Bprofile%2Bsettings%2Bsleep%2Bsocial%2Bweight%26state&requestCredentials=true');
            },function errorCallback(response) {
                console.log(JSON.stringify(response));
               
            });

  }

  this.clearGame = function(){
     self.data.penaltySteps = 0 ;
     self.data.penaltyFloors = 0 ;
     localforage.setItem('totalPenalty', 0 );
     localforage.setItem('totalPenaltyFloors', 0 );
     localforage.setItem('preExistingSteps', self.data.summary.steps );
     localforage.setItem('preExistingFloors', self.data.summary.floors );

  }
  this.addPenalty = function(){
     self.data.penaltySteps += 100 ;
     self.data.penaltyFloors += 2 ;
    
     self.data.steps = self.data.steps - 100;
     self.data.floors = self.data.floors - 2 ;

     self.data.wrongAnswers += 1 ;
     localforage.setItem("wrongAnswers", self.data.wrongAnswers);
     localforage.setItem("totalPenalty", self.data.penaltySteps);
     localforage.setItem('totalPenaltyFloors', self.data.penaltyFloors );
  }

  this.addScore = function(){
    self.data.rightAnswers += 1 ;

    console.log('new score is ' + self.data.rightAnswers);
    localforage.setItem("rightAnswers", self.data.rightAnswers);
  }
  

  this.dataArray = [
   {
   "Phrase": "Take care of the pennies and the pounds will take care of themselves",
   "Word Count": 13,
   "Character Count": 68,
   "Phrase Without Spaces": "takecareofthepenniesandthepoundswilltakecareofthemselves",
   "Consonants": "tkcrfthpnnsndthpndswlltkcrfthmslvs",
   "Consonants Count": 34,
   "Vowels Count": 34,
   "Hint": "Money, money, money!"
 },
 {
   "Phrase": "Sticks and stones may break my bones but words will never hurt me",
   "Word Count": 13,
   "Character Count": 65,
   "Phrase Without Spaces": "sticksandstonesmaybreakmybonesbutwordswillneverhurtme",
   "Consonants": "stcksndstnsmybrkmybnsbtwrdswllnvrhrtm",
   "Consonants Count": 37,
   "Vowels Count": 28,
   "Hint": "Unbreakable"
 },
 {
   "Phrase": "Better to have loved and lost than never to have loved at all",
   "Word Count": 13,
   "Character Count": 61,
   "Phrase Without Spaces": "bettertohavelovedandlostthannevertohavelovedatall",
   "Consonants": "bttrthvlvdndlstthnnvrthvlvdtll",
   "Consonants Count": 30,
   "Vowels Count": 31,
   "Hint": "50/50"
 },
 {
   "Phrase": "The only disability in life is a bad attitude",
   "Word Count": 11,
   "Character Count": 60,
   "Phrase Without Spaces": "theonlydisabilityinlifeisabadattitudescotthamilton",
   "Consonants": "thnlydsbltynlfsbdtttdsctthmltn",
   "Consonants Count": 30,
   "Vowels Count": 30,
   "Hint": "Keep your chin up!"
 },
 {
   "Phrase": "Laugh and the world laughs with you weep and you weep alone",
   "Word Count": 12,
   "Character Count": 59,
   "Phrase Without Spaces": "laughandtheworldlaughswithyouweepandyouweepalone",
   "Consonants": "lghndthwrldlghswthywpndywpln",
   "Consonants Count": 28,
   "Vowels Count": 31,
   "Hint": "One is the loneliest number"
 },
 {
   "Phrase": "Those who do not learn from history are doomed to repeat it",
   "Word Count": 12,
   "Character Count": 59,
   "Phrase Without Spaces": "thosewhodonotlearnfromhistoryaredoomedtorepeatit",
   "Consonants": "thswhdntlrnfrmhstryrdmdtrptt",
   "Consonants Count": 28,
   "Vowels Count": 31,
   "Hint": "History history."
 },
 {
   "Phrase": "History repeats itself and it does not care what it repeats",
   "Word Count": 11,
   "Character Count": 59,
   "Phrase Without Spaces": "historyrepeatsitselfanditdoesnotcarewhatitrepeats",
   "Consonants": "hstryrptstslfndtdsntcrwhttrpts",
   "Consonants Count": 30,
   "Vowels Count": 29,
   "Hint": "Is that an echo?"
 },
 {
   "Phrase": "He who fights and runs away may live to fight another day",
   "Word Count": 12,
   "Character Count": 57,
   "Phrase Without Spaces": "hewhofightsandrunsawaymaylivetofightanotherday",
   "Consonants": "hwhfghtsndrnswymylvtfghtnthrdy",
   "Consonants Count": 30,
   "Vowels Count": 27,
   "Hint": "Cowardly combatant"
 },
 {
   "Phrase": "What the eye does not see the heart does not grieve over",
   "Word Count": 12,
   "Character Count": 56,
   "Phrase Without Spaces": "whattheeyedoesnotseetheheartdoesnotgrieveover",
   "Consonants": "whtthydsntsthhrtdsntgrvvr",
   "Consonants Count": 25,
   "Vowels Count": 31,
   "Hint": "Out of sight, out of mind."
 },
 {
   "Phrase": "Everybody wants to go to heaven but nobody wants to die",
   "Word Count": 11,
   "Character Count": 55,
   "Phrase Without Spaces": "everybodywantstogotoheavenbutnobodywantstodie",
   "Consonants": "vrybdywntstgthvnbtnbdywntstd",
   "Consonants Count": 28,
   "Vowels Count": 27,
   "Hint": "The steep price of perfection."
 },
 {
   "Phrase": "What you lose on the swings you gain on the roundabouts",
   "Word Count": 11,
   "Character Count": 55,
   "Phrase Without Spaces": "whatyouloseontheswingsyougainontheroundabouts",
   "Consonants": "whtylsnthswngsygnnthrndbts",
   "Consonants Count": 26,
   "Vowels Count": 29,
   "Hint": "The stocks market, or the playground."
 },
 {
   "Phrase": "People who live in glass houses should not throw stones",
   "Word Count": 10,
   "Character Count": 55,
   "Phrase Without Spaces": "peoplewholiveinglasshousesshouldnotthrowstones",
   "Consonants": "pplwhlvnglsshssshldntthrwstns",
   "Consonants Count": 29,
   "Vowels Count": 26,
   "Hint": "Crystalline condo"
 },
 {
   "Phrase": "A journey of a thousand miles begins with a single step",
   "Word Count": 7,
   "Character Count": 55,
   "Phrase Without Spaces": "ajourneyofathousandmilesbeginswithasinglestep",
   "Consonants": "jrnyfthsndmlsbgnswthsnglstp",
   "Consonants Count": 31,
   "Vowels Count": 24,
   "Hint": "Unless your prefer to fly."
 },
 {
   "Phrase": "In the kingdom of the blind the one eyed man is king",
   "Word Count": 12,
   "Character Count": 52,
   "Phrase Without Spaces": "inthekingdomoftheblindtheoneeyedmanisking",
   "Consonants": "nthkngdmfthblndthnydmnskng",
   "Consonants Count": 26,
   "Vowels Count": 26,
   "Hint": "H.G. Wells"
 },
 {
   "Phrase": "March comes in like a lion and goes out like a lamb",
   "Word Count": 12,
   "Character Count": 51,
   "Phrase Without Spaces": "marchcomesinlikealionandgoesoutlikealamb",
   "Consonants": "mrchcmsnlklnndgstlklmb",
   "Consonants Count": 22,
   "Vowels Count": 29,
   "Hint": "Don't ask about April."
 },
 {
   "Phrase": "A place for everything and everything in its place",
   "Word Count": 9,
   "Character Count": 50,
   "Phrase Without Spaces": "aplaceforeverythingandeverythinginitsplace",
   "Consonants": "plcfrvrythngndvrythngntsplc",
   "Consonants Count": 27,
   "Vowels Count": 23,
   "Hint": "OCD"
 },
 {
   "Phrase": "Do not count your chickens before they are hatched",
   "Word Count": 9,
   "Character Count": 50,
   "Phrase Without Spaces": "donotcountyourchickensbeforetheyarehatched",
   "Consonants": "dntcntyrchcknsbfrthyrhtchd",
   "Consonants Count": 26,
   "Vowels Count": 24,
   "Hint": "They might be snakes."
 },
 {
   "Phrase": "Do unto others as you would have them do unto you",
   "Word Count": 11,
   "Character Count": 49,
   "Phrase Without Spaces": "dountoothersasyouwouldhavethemdountoyou",
   "Consonants": "dntthrssywldhvthmdnty",
   "Consonants Count": 21,
   "Vowels Count": 28,
   "Hint": "The golden rule."
 },
 {
   "Phrase": "A man with a hammer sees every problem as a nail",
   "Word Count": 11,
   "Character Count": 48,
   "Phrase Without Spaces": "amanwithahammerseeseveryproblemasanail",
   "Consonants": "mnwthhmmrssvryprblmsnl",
   "Consonants Count": 22,
   "Vowels Count": 26,
   "Hint": "One tool to rule  them all."
 },
 {
   "Phrase": "It needs a Hundred Lies to cover a Single Lie",
   "Word Count": 10,
   "Character Count": 45,
   "Phrase Without Spaces": "itneedsahundredliestocoverasinglelie",
   "Consonants": "tndshndrdlstcvrsngll",
   "Consonants Count": 20,
   "Vowels Count": 25,
   "Hint": "Snowball effect"
 },
 {
   "Phrase": "One law for the rich and another for the poor",
   "Word Count": 10,
   "Character Count": 45,
   "Phrase Without Spaces": "onelawfortherichandanotherforthepoor",
   "Consonants": "nlwfrthrchndnthrfrthpr",
   "Consonants Count": 22,
   "Vowels Count": 23,
   "Hint": "It's a hard knock life"
 },
 {
   "Phrase": "If at first you do not succeed try try again",
   "Word Count": 10,
   "Character Count": 44,
   "Phrase Without Spaces": "ifatfirstyoudonotsucceedtrytryagain",
   "Consonants": "ftfrstydntsccdtrytrygn",
   "Consonants Count": 22,
   "Vowels Count": 22,
   "Hint": "Verging on insanity"
 },
 {
   "Phrase": "Do not throw the baby out with the bathwater",
   "Word Count": 9,
   "Character Count": 44,
   "Phrase Without Spaces": "donotthrowthebabyoutwiththebathwater",
   "Consonants": "dntthrwthbbytwththbthwtr",
   "Consonants Count": 24,
   "Vowels Count": 20,
   "Hint": "Page 1, parenting manual."
 },
 {
   "Phrase": "It is the squeaky wheel that gets the grease",
   "Word Count": 9,
   "Character Count": 44,
   "Phrase Without Spaces": "itisthesqueakywheelthatgetsthegrease",
   "Consonants": "tsthsqkywhlthtgtsthgrs",
   "Consonants Count": 22,
   "Vowels Count": 22,
   "Hint": "Or replaced."
 },
 {
   "Phrase": "A nod is as good as a wink to a blind horse",
   "Word Count": 12,
   "Character Count": 43,
   "Phrase Without Spaces": "anodisasgoodasawinktoablindhorse",
   "Consonants": "ndssgdswnktblndhrs",
   "Consonants Count": 18,
   "Vowels Count": 25,
   "Hint": "Wasted efforts"
 },
 {
   "Phrase": "Do not cut off your nose to spite your face",
   "Word Count": 10,
   "Character Count": 43,
   "Phrase Without Spaces": "donotcutoffyournosetospiteyourface",
   "Consonants": "dntctffyrnstsptyrfc",
   "Consonants Count": 19,
   "Vowels Count": 24,
   "Hint": "Homemade plastic surgery"
 },
 {
   "Phrase": "Life is not all beer and skittles",
   "Word Count": 7,
   "Character Count": 33,
   "Phrase Without Spaces": "lifeisnotallbeerandskittles",
   "Consonants": "lfsntllbrndskttls",
   "Consonants Count": 17,
   "Vowels Count": 16,
   "Hint": "But it should be."
 }
  ];
});