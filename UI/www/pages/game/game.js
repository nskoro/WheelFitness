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
.controller('GameCtrl', function($ionicPopup, $ionicModal, $timeout, $interval, gameService, $scope, $state) {

	console.log('Game Controller loaded');

	var self = this;
	var vowels = ['A', 'E', 'I', 'O', 'U'];
	var numVowels;
	var numCons;
	var vowelsRevealed;
	var consRevealed;
	var vowelStack, consStack, thePhrase, noSpace;
	var thePhrase;

	this.init = function(){
		console.log('init game function');
		var obj = {} ;

		if (gameService.activeGame) {
			console.info("new game!")
			self.loadGame();
		}

		else {
			console.info("continue game!")
			obj = gameService.startGame();

			gameService.activeGame = obj ;
			gameService.activeGameFlag = true ;

			numVowels = obj.numVowels;
			numCons = obj.numCons;
			vowelsRevealed = 0;
			consRevealed = 0;
			vowelStack = obj.vowelStack;
			consStack = obj.consStack;
			self.phrase = obj.viewModel;
			thePhrase = obj.phrase;
			noSpace = obj.noSpace;
		}

		console.info(thePhrase)
	};

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
		self.initModal("pages/game/win-modal.html");
	};

	this.badGuess = function() {
		self.guess = "";
		$ionicPopup.alert({
	     title: 'Wrong Guess!',
	     template: 'Try again!'
	   });
	};

	this.initModal = function(template) {
		$ionicModal.fromTemplateUrl(template, {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			self.modal = modal;
			self.modal.show();
		});
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
			console.error("something went wrong")
			// either we have a bad lettertype or both stacks are empty
		}
	};

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
	};

	this.saveGame = function() {
		console.info("game saved!")
		var state = {
			numVowels: numVowels,
			numCons: numCons,
			vowelsRevealed: vowelsRevealed,
			consRevealed: consRevealed,
			vowelStack: vowelStack,
			consStack: consStack,
			viewModel: self.phrase,
			thePhrase: thePhrase,
			noSpace: noSpace
		};

		return localforage.setItem("gameState", state);
	};

	this.loadGame = function() {
		console.info("game loaded!")
		localforage.getItem("gameState").then(function(savedState) {
			numVowels = savedState.numVowels;
			numCons = savedState.numCons;
			vowelsRevealed = savedState.vowelsRevealed;
			consRevealed = savedState.consRevealed;
			vowelStack = savedState.vowelStack;
			consStack = savedState.consStack;
			self.phrase = savedState.viewModel;
			thePhrase = savedState.thePhrase;
			noSpace = savedState.noSpace;
		});
	};

	this.testReveal = function() {
		if(vowelStack.length > 0) {
			self.reveal("V");
		} else {
			self.reveal("C");
		}
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

			self.fitbitData.time = gameService.updateTime(h);
			
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

	$scope.$on('$ionicView.leave', function(e) {
		self.saveGame();
	});


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

		self.init();

		$interval.cancel(self.queryInterval);

		self.queryInterval = $interval( function(){ self.refreshData(); } , 260000);
	
		$timeout( self.drawFriendly, 750);
	});

	this.refreshData = function(){

		gameService.getFitbitData();
		$timeout( self.drawFriendly, 750);
		$scope.$broadcast('scroll.refreshComplete');
		self.computeGameLogic();
		
	}

	this.computeGameLogic = function(){
		var vowelWorth = parseInt( self.fitbitData.goals.floors /  numVowels);
		var consWorth = parseInt(self.fitbitData.goals.steps /  numCons) ;

		if (consWorth < 100)
			consWorth = 100 ;

		if (vowelWorth < 2)
			vowelWorth = 2 ;
		
		var vowelCount = parseInt(self.fitbitData.floors / vowelWorth );
		var consCount = parseInt(self.fitbitData.steps / consWorth );
		this.catchUp( vowelCount, consCount );
	}

	this.openGiveUpAlert = function() {
		$ionicPopup.confirm({
	     title: 'Confirm Give Up?',
	     template: 'Are you sure you want to give up on this puzzle?'
	   }).then(function(res) {
	   	if(res) {
	   		self.closeGame();
	   	} else {
	   		// do nothing
	   	}
	   });
	};

	this.closeGame = function(){
		// needs a prompt

		gameService.activeGame = false;
		$state.transitionTo('app.home');
	}
});
