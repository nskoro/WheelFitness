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
// directive for moving visual cursor through the popup input
.directive('advanceInputArea', function($timeout, $rootScope) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$timeout(function() {
				scope.spans = document.getElementById('popup-input-container').getElementsByTagName('span');
				scope.input = document.getElementById('hidden-input');
				scope.input.focus();
				scope.index = 0;
				scope.done = false;
				scope.indexStack = [];
				$rootScope.letters = [];
				findInitialInput();
				scope.previousLength = 0 ;

				element.bind('keyup', function(e) {

					scope.entirePhrase = String(scope.input.value);

					if (scope.entirePhrase.length == 0){
						findPrevInput();
					}

					if ( scope.previousLength <= scope.entirePhrase.length)
						scope.previousLength = scope.entirePhrase.length ;

					e.key = String(scope.entirePhrase).substr(scope.entirePhrase.length-1, 1);

					console.log(e.key);

					console.log('key change');

					if ( scope.previousLength > scope.entirePhrase.length ){
						console.log('prev ' + scope.previousLength + ' current ' + scope.entirePhrase.length);
						console.log('delete a char');
				//	 if(e.key == "Backspace" || e.key == "Delete") {
						e.preventDefault();
						findPrevInput();
						scope.previousLength = scope.entirePhrase.length ;
					} else if(e.key.match(/^[a-z]$/i)) {
						if(!scope.done) {
							e.preventDefault();
							scope.spans[scope.index].innerHTML = e.key.toUpperCase();
							$rootScope.letters[scope.index] = e.key.toUpperCase();
							findNextInput(scope.index);
						}
					} else {
						console.error("Incorrect key: " + e.key)
						e.preventDefault();
					}
				});
			}, 150);

			$rootScope.clickedPopup = function() {
				scope.input.focus();
			};

            // find first place for the cursor
			function findInitialInput() {
				for(var i = 0; i < scope.spans.length; i++) {
					if(scope.spans[i].innerHTML == ".") {
						scope.index = i;
						scope.spans[scope.index].className += " char-selected";
						return;
					}
				}
				scope.done = true;
			}

            // go back to a previous input
			function findPrevInput() {
				scope.done = false;
				if(scope.indexStack.length > 0) {
					console.log('moving back index');
					scope.spans[scope.index].classList.remove("char-selected");
					var ind = scope.indexStack.shift();
					scope.spans[ind].innerHTML = ".";
					scope.index = ind;
					scope.spans[scope.index].className += " char-selected";
				} else {
					console.error("beginning reached!");
				}
			}

            // find the next spot for the cursor
			function findNextInput(startIndex) {
				scope.indexStack.unshift(startIndex);
				scope.spans[scope.index].classList.remove("char-selected");
				for(var i = startIndex; i < scope.spans.length; i++) {
					if(scope.spans[i].innerHTML == ".") {
						scope.index = i;
						scope.spans[scope.index].className += " char-selected";
						return;
					}
				}
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
	var vowelStack, consStack, thePhrase, noSpace;
	var thePhrase;
	var obj = {} ; // game save obj

    // start the game
	this.init = function(){
		console.log('init game function');

		self.loadGame();
	};

    // show the input popup to the user and check their guess
	this.showPopup = function() {
		$rootScope.copy = _.cloneDeep(self.phrase);
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
						var actual = self.translateViewModel($rootScope.copy).toUpperCase().replace(/\s/g, '');
						var expected = thePhrase.toUpperCase().replace(/\s/g, '');
						console.info(actual)
						console.info(expected)
						if(actual && actual === expected) {
							self.goodGuess();
						} else {
							self.badGuess();
						}
					}
				}
			]
		});
	};

	// Convert view model to string representation
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

	// convert the viewmodel + letters the user entered into an answer
	this.translateViewModel = function(viewModel) {
		var str = "";
		for(var a = 0; a < viewModel.length; a++) {
			for(var b = 0; b < viewModel[a].length; b++) {
				if(viewModel[a][b].model == ".") {
					str += $rootScope.letters.shift();
				} else {
					str += viewModel[a][b].letter;
					$rootScope.letters.shift();
				}
			}
			str += "  ";
		}
		return str;
	};

    // the user guessed correctly
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

    // the user guessed incorrectly
	this.badGuess = function() {
		self.guess = "";
		$ionicPopup.alert({
	     title: 'Wrong Guess!',
	     template: 'Penalty points were added to your goals. Try again!'
	   });

	   gameService.addPenalty();
	};

    // ran out of time
	this.timeExpired = function(){
		self.guess = "";
			$ionicPopup.alert({
	  		   title: 'Time Expired!',
	  		   template: 'Uh no! You ran out of time. Better luck next time!'
	   });

	   $state.go('app.home');

	}

    // reveal the next letter given a type of letter (vowel or consonant) and the index of the letter
	this.reveal = function(letterType, index) {
		var curr;
		if(letterType === "V" && index < vowelStack.length - 1) {
			curr = vowelStack[index];
			if (curr) {
				curr.model = curr.letter;
				curr.revealed = true;
			}
		} else if(letterType === "C" && index < consStack.length - 1) {
			curr = consStack[index];
			if (curr) {
				curr.model = curr.letter;
				curr.revealed = true;
			}
		} else {
			// either we have a bad lettertype or both stacks are empty
			console.warn("Reached end of " + letterType + " stack");
		}
	};

	// reveals the entire phrase
	this.revealAll = function() {
		if (vowelStack)
				vowelStack.forEach(function(d) {
					d.model = d.letter;
				});

	    if (consStac)
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
			self.reveal("V", a);
		}

		for(var b = 0; b < consonants; b++) {
			self.reveal("C", b);
		}

		self.saveGame();
	};

	// rebuilds stacks
	this.reconstruct = function(viewModel) {
		for(var i = 0; i < viewModel.length; i++) {
			for(var j = 0; j < viewModel[i].length; j++) {
				if(viewModel[i][j].letterType == "V") {
					vowelStack[viewModel[i][j].order] = viewModel[i][j];
				} else {
					consStack[viewModel[i][j].order] = viewModel[i][j];
				}
			}
		}
	};

    // start over with no letters revealed
	this.resetRevealed = function() {
		var vmCopy = _.cloneDeep(self.phrase);
		for(var i = 0; i < vmCopy.length; i++) {
			for(var j = 0; j < vmCopy[i].length; j++) {
				vmCopy[i][j].revealed = false;
				vmCopy[i][j].model = ".";
			}
		}

		return vmCopy;
	};

    // save the game to the local cache
	this.saveGame = function() {

		if (!gameService.activeGame)
			return null ;

		console.info("game saved!")

		var state = {
			numVowels: numVowels,
			numCons: numCons,
			viewModel: self.resetRevealed(),
			thePhrase: thePhrase,
			noSpace: noSpace,
			hint: self.hint
		};

		return localforage.setItem("gameState", state);
	};

    // load the game from the cache
	this.loadGame = function() {
		console.info("game loaded!")
		localforage.getItem("gameState").then(function(savedState) {

			if (savedState){

				//savedState = JSON.parse(savedState);

				numVowels = savedState.numVowels;
				numCons = savedState.numCons;
				self.phrase = savedState.viewModel;
				thePhrase = savedState.thePhrase;
				noSpace = savedState.noSpace;
				self.hint = savedState.hint;

				consStack = [];
				vowelStack = [];
				self.reconstruct(self.phrase);
			}
			else{
				obj = gameService.startGame();
				self.guess = "" ;

			//	gameService.activeGame = obj ;
				gameService.activeGameFlag = true ;

				numVowels = obj.numVowels;
				numCons = obj.numCons;
				vowelStack = obj.vowelStack;
				consStack = obj.consStack;
				self.phrase = obj.viewModel;
				thePhrase = obj.phrase;
				noSpace = obj.noSpace;
				self.hint = obj.hint;

				self.saveGame();

			}
			gameService.activeGame = true;

			self.fitbitData.gameGoalVowels = 2 * numVowels ;
			self.fitbitData.gameGoalCons = 100 * numCons ;
		});
	};

    // draws the "friendly" (your) progress circle
	this.drawFriendly = function() {

		console.log('goal steps ' + self.fitbitData.goals.steps);

		jQuery("#friend-progress").empty();

			self.friendlyProgress = jQuery("#friend-progress").radialMultiProgress("init", {
				'fill': 25,
				'font-size': 14,
				'size': 100,
				'data': [
					{'color': "#2DB1E4", 'range': [0, gameService.data.gameGoalCons]}, // steps
					{'color': "#9CCA13", 'range': [0, gameService.data.gameGoalVowels]}, // floors
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

    // save the game when we leave the view
	$scope.$on('$ionicView.leave', function(e) {
		self.saveGame();
	});

    // initialize the game when we enter the view
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
			gameService.getFitbitData().then(function(result){
				self.init();
				$timeout( self.computeGameLogic, 1500);
				$timeout( self.drawFriendly, 2000);
				self.autoSave();
			})
		});

		$interval.cancel(self.queryInterval);

		self.queryInterval = $interval( function(){ self.refreshData(); } , 260000);

	});

    // refresh steps and stairs
	this.refreshData = function(){

		gameService.getFitbitData();
		$timeout( self.computeGameLogic, 2000);
		$timeout( self.drawFriendly, 750);
		$scope.$broadcast('scroll.refreshComplete');
	}

    // figure out how many letters steps and stairs are worth
	this.computeGameLogic = function(){
	//	var vowelWorth = parseInt( self.fitbitData.goalFloors /  numVowels);
	//	var consWorth = parseInt(self.fitbitData.goalSteps /  numCons) ;

		var consWorth = 100 ;
		var vowelWorth = 2;

		self.fitbitData.gameGoalVowels = vowelWorth * numVowels ;
		self.fitbitData.gameGoalCons = consWorth * numCons

	//	if (consWorth < 100) // min steps required
	//		consWorth = 100 ;

	//	if (vowelWorth < 2) // min floors required
	//		vowelWorth = 2 ;
	
		if (!self.fitbitData.floors){
				$ionicPopup.alert({
					title: 'Incompatible Device',
					template: 'Your FitBit Device must support floor counting in order to play this game :('
	  		 });

			return ;
		}

		console.log('steps walked ' + self.fitbitData.steps);
		var vowelCount = parseInt(self.fitbitData.floors / vowelWorth );
		var consCount = parseInt(self.fitbitData.steps / consWorth );

		if (vowelCount < 0)
			vowelCount = 0;
		if (consCount < 0)
			consCount = 0 ;

		console.log('vowelWorth: ' + vowelWorth);
		console.log('consWorth: ' + consWorth);

		self.catchUp( vowelCount, consCount );
	}

    // prompt the user before giving up
	this.openGiveUpAlert = function() {
		$ionicPopup.confirm({
	     title: 'Give Up',
	     template: 'Are you sure you want to give up on this puzzle? Your current game progress will be lost.',
		 okText: 'Give Up'
	   }).then(function(res) {
	   	if(res) {
	   		self.closeGame();
	   	} else {
	   		// do nothing
	   	}
	   });
	};

    // clear the local cache
	this.closeGame = function(){
		// needs a prompt

		localforage.removeItem("gameState");
		$interval.cancel(self.autoSaveInterval);
		gameService.activeGame = false;
		gameService.clearGame();
		$state.transitionTo('app.home');
	}

    // save the game periodically
	this.autoSave = function(){

		$interval.cancel(self.autoSaveInterval);

		self.autoSaveInterval = $interval( function(){ self.saveGame(); }, 2000);

	}
});
