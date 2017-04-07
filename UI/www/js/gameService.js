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
 this.vowels = ['A', 'E', 'I', 'O', 'U'];
 this.activeGame = false ;
 this.data.goalSteps = 0 ;
 this.data.goalFloors = 0 ;

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
      if (result)
        self.data.goalSteps = result ;
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

  self.data.goalSteps = self.data.goalSteps + self.data.steps ;
  self.data.goalFloors = self.data.goalFloors + self.data.floors;

  return {
    numVowels: numVowels,
    numCons: numCons,
    phrase: phrase,
    noSpace: noSpace,
    vowelStack: vowelStack,
    consStack: consStack,
    viewModel: viewModel
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
                self.data.summary = response.data.summary ;

                self.data.goals = response.data.goals ;

                if ( self.data.goalSteps == 0 ){
                      self.data.goalSteps = self.data.goals.steps ;
                      self.data.goalFloors = self.data.floors ;
                }
              
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
      // local
      window.location.replace('http://localhost:8100');
      
      //production
      //window.location.replace('https://wheelfitness.herokuapp.com');
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
     self.data.goalSteps = 0 ;
     self.data.goalFloors = 0 ;
     localforage.setItem('totalPenalty', 0 );
  }
  this.addPenalty = function(){
     self.data.goalSteps += 400 ;
     self.data.goalFloors += 2 ;

     // 
     self.data.wrongAnswers += 1 ;
     localforage.setItem("wrongAnswers", self.data.wrongAnswers);
     localforage.setItem("totalPenalty", self.data.goalSteps);
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
     "Vowels Count": 34
   },
   {
     "Phrase": "Sticks and stones may break my bones but words will never hurt me",
     "Word Count": 13,
     "Character Count": 65,
     "Phrase Without Spaces": "sticksandstonesmaybreakmybonesbutwordswillneverhurtme",
     "Consonants": "stcksndstnsmybrkmybnsbtwrdswllnvrhrtm",
     "Consonants Count": 37,
     "Vowels Count": 28
   },
   {
     "Phrase": "It is no use locking the stable door after the horse has bolted",
     "Word Count": 13,
     "Character Count": 63,
     "Phrase Without Spaces": "itisnouselockingthestabledoorafterthehorsehasbolted",
     "Consonants": "tsnslckngthstbldrftrthhrshsbltd",
     "Consonants Count": 31,
     "Vowels Count": 32
   },
   {
     "Phrase": "There are more ways of killing a cat than choking it with cream",
     "Word Count": 13,
     "Character Count": 63,
     "Phrase Without Spaces": "therearemorewaysofkillingacatthanchokingitwithcream",
     "Consonants": "thrrmrwysfkllngctthnchkngtwthcrm",
     "Consonants Count": 32,
     "Vowels Count": 31
   },
   {
     "Phrase": "Better to have loved and lost than never to have loved at all",
     "Word Count": 13,
     "Character Count": 61,
     "Phrase Without Spaces": "bettertohavelovedandlostthannevertohavelovedatall",
     "Consonants": "bttrthvlvdndlstthnnvrthvlvdtll",
     "Consonants Count": 30,
     "Vowels Count": 31
   },
   {
     "Phrase": "One half of the world does not know how the other half lives",
     "Word Count": 13,
     "Character Count": 60,
     "Phrase Without Spaces": "onehalfoftheworlddoesnotknowhowtheotherhalflives",
     "Consonants": "nhlffthwrlddsntknwhwththrhlflvs",
     "Consonants Count": 31,
     "Vowels Count": 29
   },
   {
     "Phrase": "The only disability in life is a bad attitude Scott Hamilton",
     "Word Count": 11,
     "Character Count": 60,
     "Phrase Without Spaces": "theonlydisabilityinlifeisabadattitudescotthamilton",
     "Consonants": "thnlydsbltynlfsbdtttdsctthmltn",
     "Consonants Count": 30,
     "Vowels Count": 30
   },
   {
     "Phrase": "Laugh and the world laughs with you weep and you weep alone",
     "Word Count": 12,
     "Character Count": 59,
     "Phrase Without Spaces": "laughandtheworldlaughswithyouweepandyouweepalone",
     "Consonants": "lghndthwrldlghswthywpndywpln",
     "Consonants Count": 28,
     "Vowels Count": 31
   },
   {
     "Phrase": "Those who do not learn from history are doomed to repeat it",
     "Word Count": 12,
     "Character Count": 59,
     "Phrase Without Spaces": "thosewhodonotlearnfromhistoryaredoomedtorepeatit",
     "Consonants": "thswhdntlrnfrmhstryrdmdtrptt",
     "Consonants Count": 28,
     "Vowels Count": 31
   },
   {
     "Phrase": "History repeats itself and it does not care what it repeats",
     "Word Count": 11,
     "Character Count": 59,
     "Phrase Without Spaces": "historyrepeatsitselfanditdoesnotcarewhatitrepeats",
     "Consonants": "hstryrptstslfndtdsntcrwhttrpts",
     "Consonants Count": 30,
     "Vowels Count": 29
   },
   {
     "Phrase": "You can lead a horse to water but you cannot make it drink",
     "Word Count": 13,
     "Character Count": 58,
     "Phrase Without Spaces": "youcanleadahorsetowaterbutyoucannotmakeitdrink",
     "Consonants": "ycnldhrstwtrbtycnntmktdrnk",
     "Consonants Count": 26,
     "Vowels Count": 32
   },
   {
     "Phrase": "Hunger never knows the taste sleep never knows the comfort",
     "Word Count": 10,
     "Character Count": 58,
     "Phrase Without Spaces": "hungerneverknowsthetastesleepneverknowsthecomfort",
     "Consonants": "hngrnvrknwsthtstslpnvrknwsthcmfrt",
     "Consonants Count": 33,
     "Vowels Count": 25
   },
   {
     "Phrase": "He who lives by the sword shall die by the sword",
     "Word Count": 11,
     "Character Count": 48,
     "Phrase Without Spaces": "hewholivesbytheswordshalldiebythesword",
     "Consonants": "hwhlvsbythswrdshlldbythswrd",
     "Consonants Count": 27,
     "Vowels Count": 21
   },
   {
     "Phrase": "The innocent seldom find an uncomfortable pillow",
     "Word Count": 7,
     "Character Count": 48,
     "Phrase Without Spaces": "theinnocentseldomfindanuncomfortablepillow",
     "Consonants": "thnncntsldmfndnncmfrtblpllw",
     "Consonants Count": 27,
     "Vowels Count": 21
   },
   {
     "Phrase": "There is none so blind as those who will not see",
     "Word Count": 11,
     "Character Count": 48,
     "Phrase Without Spaces": "thereisnonesoblindasthosewhowillnotsee",
     "Consonants": "thrsnnsblndsthswhwllnts",
     "Consonants Count": 23,
     "Vowels Count": 25
   },
   {
     "Phrase": "An ounce of prevention is worth a pound of cure",
     "Word Count": 10,
     "Character Count": 47,
     "Phrase Without Spaces": "anounceofpreventionisworthapoundofcure",
     "Consonants": "nncfprvntnswrthpndfcr",
     "Consonants Count": 21,
     "Vowels Count": 26
   },
   {
     "Phrase": "Give a man rope enough and he will hang himself",
     "Word Count": 10,
     "Character Count": 47,
     "Phrase Without Spaces": "giveamanropeenoughandhewillhanghimself",
     "Consonants": "gvmnrpnghndhwllhnghmslf",
     "Consonants Count": 23,
     "Vowels Count": 24
   },
   {
     "Phrase": "It is better to travel hopefully than to arrive",
     "Word Count": 9,
     "Character Count": 47,
     "Phrase Without Spaces": "itisbettertotravelhopefullythantoarrive",
     "Consonants": "tsbttrttrvlhpfllythntrrv",
     "Consonants Count": 24,
     "Vowels Count": 23
   },
   {
     "Phrase": "They that sow the wind shall reap the whirlwind",
     "Word Count": 9,
     "Character Count": 47,
     "Phrase Without Spaces": "theythatsowthewindshallreapthewhirlwind",
     "Consonants": "thythtswthwndshllrpthwhrlwnd",
     "Consonants Count": 28,
     "Vowels Count": 19
   },
   {
     "Phrase": "Genius is an infinite capacity for taking pains",
     "Word Count": 8,
     "Character Count": 47,
     "Phrase Without Spaces": "geniusisaninfinitecapacityfortakingpains",
     "Consonants": "gnssnnfntcpctyfrtkngpns",
     "Consonants Count": 23,
     "Vowels Count": 24
   },
   {
     "Phrase": "Keep your friends close and your enemies closer",
     "Word Count": 8,
     "Character Count": 47,
     "Phrase Without Spaces": "keepyourfriendscloseandyourenemiescloser",
     "Consonants": "kpyrfrndsclsndyrnmsclsr",
     "Consonants Count": 23,
     "Vowels Count": 24
   },
   {
     "Phrase": "Lightning never strikes twice in the same place",
     "Word Count": 8,
     "Character Count": 47,
     "Phrase Without Spaces": "lightningneverstrikestwiceinthesameplace",
     "Consonants": "lghtnngnvrstrkstwcnthsmplc",
     "Consonants Count": 26,
     "Vowels Count": 21
   },
   {
     "Phrase": "If a job is worth doing it is worth doing well",
     "Word Count": 11,
     "Character Count": 46,
     "Phrase Without Spaces": "ifajobisworthdoingitisworthdoingwell",
     "Consonants": "fjbswrthdngtswrthdngwll",
     "Consonants Count": 23,
     "Vowels Count": 23
   },
   {
     "Phrase": "The bread never falls but on its buttered side",
     "Word Count": 9,
     "Character Count": 46,
     "Phrase Without Spaces": "thebreadneverfallsbutonitsbutteredside",
     "Consonants": "thbrdnvrfllsbtntsbttrdsd",
     "Consonants Count": 24,
     "Vowels Count": 22
   },
   {
     "Phrase": "The hand that rocks the cradle rules the world",
     "Word Count": 9,
     "Character Count": 46,
     "Phrase Without Spaces": "thehandthatrocksthecradlerulestheworld",
     "Consonants": "thhndthtrcksthcrdlrlsthwrld",
     "Consonants Count": 27,
     "Vowels Count": 19
   },
   {
     "Phrase": "The road to Hell is paved with good intentions",
     "Word Count": 9,
     "Character Count": 46,
     "Phrase Without Spaces": "theroadtohellispavedwithgoodintentions",
     "Consonants": "thrdthllspvdwthgdntntns",
     "Consonants Count": 23,
     "Vowels Count": 23
   }
  ];
});