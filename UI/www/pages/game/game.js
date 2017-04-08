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
.directive('advanceInputArea', function($timeout, $rootScope) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$timeout(function() {
				scope.inputs = document.getElementById('popup-input-container').getElementsByTagName('input');
				scope.index = 0;
				scope.done = false;
				scope.indexStack = [];
				$rootScope.letters = [];
				findInitialInput();

				element.bind('keydown', function(e) {
					 if(e.key == "Backspace" || e.key == "Delete") {
						e.preventDefault();
						findPrevInput();
					} else if(e.key.match(/^[a-z]$/i)) {
						if(!scope.done) {
							e.preventDefault();
							scope.inputs[scope.index].value = e.key;
							$rootScope.letters[scope.index] = e.key;
							findNextInput(scope.index);
						}
					} else {
						console.error("Incorrect key: " + e.key)
						e.preventDefault();
					}
				});
			}, 150);

			function findInitialInput() {
				for(var i = 0; i < scope.inputs.length; i++) {
					if(scope.inputs[i].value == ".") {
						scope.inputs[i].select();
						scope.inputs[i].focus();
						scope.index = i;
						return;
					}
				}
				scope.inputs[scope.index].blur();
				scope.done = true;
			}

			function findPrevInput() {
				if(scope.indexStack.length > 0) {
					var ind = scope.indexStack.shift();
					scope.inputs[ind].value = ".";
					scope.inputs[ind].select();
					scope.inputs[ind].focus();
					scope.index = ind;
				} else {
					console.error("beginning reached!")
				}
			}

			function findNextInput(startIndex) {
				scope.indexStack.unshift(startIndex);
				for(var i = startIndex; i < scope.inputs.length; i++) {
					if(scope.inputs[i].value == ".") {
						scope.inputs[i].select();
						scope.inputs[i].focus();
						scope.index = i;
						return;
					}
				}
				scope.inputs[scope.index].blur();
				scope.done = true;
			}
		}
	}
})
.controller('GameCtrl', function($ionicPopup, $ionicModal, $timeout, $interval, $rootScope, gameService, $scope, $state) {

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

		self.loadGame();
	};

	this.showPopup = function() {
		$scope.copy = _.cloneDeep(self.phrase);
		$scope.data = self.stringifyViewModel(self.phrase);
		console.info(thePhrase)
		var guessPopup = $ionicPopup.show({
			templateUrl: 'pages/game/guess-popup.html',
			title: 'Enter Phrase',
			scope: $scope,
			buttons: [
				{ 
					text: 'Cancel',
					type: 'button-dark' 
				},
				{ 
					text: 'Solve The Puzzle',
					type: 'button-positive',
					onTap: function(e) {
						var actual = self.guess.toUpperCase().trim();
						var expected = thePhrase.toUpperCase().trim();
						console.info(actual)
						console.info(expected)
						if(actual === expected) {
							self.goodGuess();
						} else {
							self.badGuess();
						}
					}
				}
			]
		});
	};

	this.stringifyViewModel = function(viewModel) {
		var str = "";
		for(var a = 0; a < viewModel.length; a++) {
			for(var b = 0; b < viewModel[a].length; b++) {
				if(viewModel[a][b].revealed) {
					str += viewModel[a][b].letter;
				} else {
					str += ".";
				}
			}
			str += "  ";
		}
		return str;
	};

	this.goodGuess = function() {
		console.log("good guess!")
		$ionicPopup.alert({
	     	title: 'You are correct!',
	    	 template: 'Great Job! Play another.'
	   });
		self.revealAll();
		self.closeGame();
		gameService.addScore();

	};

	this.badGuess = function() {
		self.guess = "";
		$ionicPopup.alert({
	     title: 'Wrong Guess!',
	     template: 'Penalty points were added to your goals. Try again!'
	   });

	   gameService.addPenalty();
	};

	this.timeExpired = function(){
		self.guess = "";
			$ionicPopup.alert({
	  		   title: 'Time Expired!',
	  		   template: 'Uh no! You ran out of time. Better luck next time!'
	   });

	   $state.go('app.home');

	}

	this.initModal = function(template) {
		$ionicModal.fromTemplateUrl(template, {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			self.modal = modal;
			self.modal.show();
		});
	};

	this.reveal = function(letterType) {
		var curr;
		if(letterType === "V" && vowelStack.length > 1) {
			curr = vowelStack.shift();
			if (curr) {
				curr.model = curr.letter;
				curr.revealed = true;
				vowelsRevealed++;
			}
		} else if(letterType === "C" && consStack.length > 1) {
			curr = consStack.shift();
			if (curr) {
				curr.model = curr.letter;
				curr.revealed = true;
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
		console.log('catch up to ' + vowels, consonants);
		if(vowels < 0 || consonants < 0) {
			return;
		}

		for(var a = 0; a < vowels; a++) {
			self.reveal("V");
		}

		for(var b = 0; b < consonants; b++) {
			self.reveal("C");
		}

		self.saveGame();
	};

	this.saveGame = function() {
		console.info("game saved!")

		if (!gameService.activeGame)
			return null ;

		var state = {
			numVowels: numVowels,
			numCons: numCons,
			vowelsRevealed: vowelsRevealed,
			consRevealed: consRevealed,
			vowelStack: vowelStack,
			consStack: consStack,
			viewModel: self.phrase,
			thePhrase: thePhrase,
			noSpace: noSpace,
			hint: self.hint
		};

		return localforage.setItem("gameState", JSON.stringify(state));
	};

	this.loadGame = function() {
		console.info("game loaded!")
		localforage.getItem("gameState").then(function(savedState) {

			if (savedState){

				savedState = JSON.parse(savedState);
				
				numVowels = savedState.numVowels;
				numCons = savedState.numCons;
				vowelsRevealed = savedState.vowelsRevealed;
				consRevealed = savedState.consRevealed;
				vowelStack = savedState.vowelStack;
				consStack = savedState.consStack;
				self.phrase = savedState.viewModel;
				thePhrase = savedState.thePhrase;
				noSpace = savedState.noSpace;
				self.hint = savedState.hint;
			}
			else{
				obj = gameService.startGame();
				self.guess = "" ;

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
				self.hint = obj.hint;

				self.saveGame();

			}
			gameService.activeGame = true;
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
			$timeout( self.computeGameLogic, 4000);
		});

		self.init();

		$interval.cancel(self.queryInterval);

		self.queryInterval = $interval( function(){ self.refreshData(); } , 260000);
	
		$timeout( self.drawFriendly, 1000);
	});

	this.refreshData = function(){

		gameService.getFitbitData();
		$timeout( self.computeGameLogic, 2000);
		$timeout( self.drawFriendly, 750);
		$scope.$broadcast('scroll.refreshComplete');
	}

	this.computeGameLogic = function(){
		var vowelWorth = parseInt( self.fitbitData.goals.floors /  numVowels);
		var consWorth = parseInt(self.fitbitData.goals.steps /  numCons) ;

		if (consWorth < 200) // min steps required
			consWorth = 200 ;

		if (vowelWorth < 1) // min floors required
			vowelWorth = 1 ;
		
		var vowelCount = parseInt(self.fitbitData.floors / vowelWorth ) - vowelsRevealed;
		var consCount = parseInt(self.fitbitData.steps / consWorth ) - consRevealed;
		
		if (vowelCount < 0)
			vowelCount = 0;
		if (consCount < 0)
			consCount = 0 ;

		self.catchUp( vowelCount, consCount );
	}

	this.openGiveUpAlert = function() {
		$ionicPopup.confirm({
	     title: 'Aww You\'re Ready To Give Up Already?',
	     template: 'Are you sure you want to give up on this puzzle? All progress will be lost.',
		 okText: 'Give Up'
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

		localforage.removeItem("gameState");

		gameService.activeGame = false;
		gameService.clearGame();
		$state.transitionTo('app.home');
	}
});
