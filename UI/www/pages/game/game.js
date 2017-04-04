angular.module('fitness.game', [])

// directive for auto-focusing popup input when shown
.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      $timeout(function() {
        element[0].focus(); 
      }, 150);
    }
  };
})
.controller('GameCtrl', function($ionicPopup, $timeout, $interval, gameService, $scope, $state) {

	console.log('Game Controller loaded');

	var self = this;
	var vowels = ['A', 'E', 'I', 'O', 'U'];
	var numVowels;
	var numCons;
	var vowelsRevealed;
	var consRevealed;
	var vowelStack, consStack, thePhrase, noSpace;
	var thePhrase;

	(function() {
		var obj = gameService.startGame();
		numVowels = obj.numVowels;
		numCons = obj.numCons;
		vowelsRevealed = 0;
		consRevealed = 0;
		vowelStack = obj.vowelStack;
		consStack = obj.consStack;
		self.phrase = obj.viewModel;
		thePhrase = obj.phrase;
		noSpace = obj.noSpace;
		console.info(thePhrase)
	}());

	this.showPopup = function() {
		var guessPopup = $ionicPopup.show({
			template: '<input focus-me class="popup-input" ng-model="vm.guess">',
			title: 'Enter Phrase',
			scope: $scope,
			buttons: [
				{ 
					text: 'Cancel',
					type: 'button-dark' 
				},
				{ 
					text: 'Solve',
					type: 'button-positive',
					onTap: function(e) {
						if(self.guess.toUpperCase() === thePhrase) {
							self.goodGuess();
						} else {
							self.badGuess();
						}
					}
				}
			]
		});
	};

	this.goodGuess = function() {
		console.log("good guess!")
		self.revealAll();
	};

	this.badGuess = function() {
		self.guess = "";
		console.log("bad guess!")
	};

	// this will replace the existing reveal function
	this.reveal = function(letterType) {
		var curr;
		if(letterType === "V" && vowelStack.length != 0) {
			curr = vowelStack.shift();
			if (curr) {
				curr.model = curr.letter;
				vowelsRevealed++;
			}
		} else if(letterType === "C" && consStack.length != 0) {
			curr = consStack.shift();
			if (curr) {
				curr.model = curr.letter;
				consRevealed++;
			}
		} else {
			// either we have a bad lettertype or both stacks are empty
		}
	}

	// reveals the entire phrase
	this.revealAll = function() {
		vowelStack.forEach(function(d) {
			d.model = d.letter;
		});

		consStack.forEach(function(d) {
			d.model = d.letter;
		});
	}

	// takes the number of vowels and consonants that should be revealed and reveals them
	this.catchUp = function(vowels, consonants) {
		if(vowels < 0 || consonants < 0) {
			return;
		}

		for(var a = 0; a < vowels; a++) {
			self.reveal("V");
		}

		for(var b = 0; b < consonants; b++) {
			self.reveal("C");
		}
	}

	this.saveState = function() {
		console.log(data)
		console.log(self.phrase);
		console.log(vowelStack)
		console.log(consStack)
		// localforage.setItem("tbd_PHRASE", data);
		// localforage.setItem("tbd_VIEWMODEL", self.phrase);
		// localforage.setItem("tbd_VSTACK", vowelStack);
		// localforage.setItem("tbd_CSTACK", consStack);
	}

	this.loadState = function() {
		return localforage.getItem("tbd_PHRASE").then(function(value1) {
			return localforage.getItem("tbd_PHRASE");
		}).then(function(value2) {

		});
	}

	this.drawFriendly = function() {

		console.log('goal steps ' + self.fitbitData.goals.steps);

		jQuery("#friend-progress").empty();
		
			self.friendlyProgress = jQuery("#friend-progress").radialMultiProgress("init", {
				'fill': 25,
				'font-size': 14,
				'size': 100,
				'data': [
					{'color': "#2DB1E4", 'range': [0, self.fitbitData.goals.steps]}, // steps
					{'color': "#9CCA13", 'range': [0, self.fitbitData.goals.floors]}, // floors
					{'color': "#cf2583", 'range': [0, 24]} // time
				]
			});
			
		var dh, dm, ds;
	//	setInterval(function() {
			console.log('in the draw circle func.');

			var date = new Date(),
	        h = date.getHours(),
	        m = date.getMinutes(),
	        s = date.getSeconds();

			self.fitbitData.time = gameService.updateTime(24-h);
			
			console.log('hours is ' + h);

	    	self.friendlyProgress.radialMultiProgress("to", {
	      		"index": 0, 'perc': self.fitbitData.steps, 'time': 10
	      	});
	    	self.friendlyProgress.radialMultiProgress("to", {
	    		"index": 1, 'perc': self.fitbitData.floors, 'time': 10
	    	});
	    	self.friendlyProgress.radialMultiProgress("to", {
	    		"index": 2, 'perc': h, 'time': 10
	    	});
	  //  }
//	  }, 1000);
	};


	$scope.$on('$ionicView.enter', function(e) {
	
		self.fitbitData = {} ;
		self.fitbitData.goals = {} ;

		self.fitbitData = gameService.data ;

	
		console.log('steps in game.js: ' + self.fitbitData.steps);
    
		console.log('getting access token from storage');
		localforage.getItem('fitbitToken').then(function(token){
			if (!token)
				gameService.reload();

			gameService.fitbitToken = token;
			console.log('saving token to game service: ' + token);
			gameService.getFitbitData();
		});

		$interval.cancel(self.queryInterval);

		self.queryInterval = $interval( function(){ self.refreshData(); } , 120000);
	
		$timeout( self.drawFriendly, 750);
	});

	this.refreshData = function(){

		gameService.getFitbitData();
		$timeout( self.drawFriendly, 750);
		$scope.$broadcast('scroll.refreshComplete');
	}
});
