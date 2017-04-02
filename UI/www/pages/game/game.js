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
	var numVowels = 0;
	var numCons = 0;
	var vowelsRevealed = 0;
	var consRevealed = 0;
	var vowelStack, consStack;

	var data = "The rain in spain falls mainly on the plain";
	data = data.toUpperCase();


	// stole this from http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	this.shuffleArray = function(array) {
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	}

	// count vowels and consonants so we know the range for random numbers
	for(var i = 0; i < data.length; i++) {
		// don't care if it's a space
		if(data.charAt(i) === " ") {
			continue;
		} 
		// increment vowel count
		else if(vowels.includes(data.charAt(i))) {
			numVowels++;
		}
		// increment consonant count
		else {
			numCons++;
		}
	}
	
	var orderVowels = [];
	for(var a = 0; a < numVowels; a++) {
		orderVowels[a] = a;
	}

	var orderCons = [];
	for(var b = 0; b < numCons; b++) {
		orderCons[b] = b;
	}

	orderVowels = self.shuffleArray(orderVowels);
	orderCons = self.shuffleArray(orderCons);

	vowelStack = new Array(numVowels);
	consStack = new Array(numCons);

	var parts = data.split(" ");
	self.phrase = [];
	parts.forEach(function(d) {
		var temp = [];
		for(var x = 0; x < d.length; x++) {
			var obj = {
				letter: d[x],
				revealed: false,
				model: "."
			};

			if(vowels.includes(d[x])) {
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
		self.phrase.push(temp)
	});

	// button click handler, exhausts vowels first, then consonants
	this.reveal = function() {
		if(vowelStack.length == 0) {
			var curr = consStack.shift();
			if (curr) {
				curr.model = curr.letter;
				vowelsRevealed++;
			}
		} else {
			var curr = vowelStack.shift();
			if (curr) {
				curr.model = curr.letter;
				consRevealed++;
			}
		}
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
						if(self.guess.toUpperCase() === data) {
							goodGuess();
						} else {
							badGuess();
						}
					}
				}
			]
		});
	};

	function goodGuess() {
		console.log("good guess!")
		revealAll();
	}

	function badGuess() {
		self.guess = "";
		console.log("bad guess!")
	}

	// this will replace the existing reveal function
	function reveal1(letterType) {
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
	function revealAll() {
		vowelStack.forEach(function(d) {
			d.model = d.letter;
		});

		consStack.forEach(function(d) {
			d.model = d.letter;
		});
	}

	// takes the number of vowels and consonants that should be revealed and reveals them
	function catchUp(vowels, consonants) {
		if(vowels < 0 || consonants < 0) {
			return;
		}

		for(var a = 0; a < vowels; a++) {
			reveal1("V");
		}

		for(var b = 0; b < consonants; b++) {
			reveal1("C");
		}
	}

	function saveState() {
		console.log(data)
		console.log(self.phrase);
		console.log(vowelStack)
		console.log(consStack)
		// localforage.setItem("tbd_PHRASE", data);
		// localforage.setItem("tbd_VIEWMODEL", self.phrase);
		// localforage.setItem("tbd_VSTACK", vowelStack);
		// localforage.setItem("tbd_CSTACK", consStack);
	}

	function loadState() {
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
