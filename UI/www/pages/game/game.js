angular.module('fitness.game', [])

.controller('GameCtrl', function($ionicPopup, $timeout, $interval, gameService, $scope, $state) {

	console.log('Game Controller loaded');

	var self = this;
	var vowels = ['A', 'E', 'I', 'O', 'U'];
	var numVowels = 0;
	var numCons = 0;
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
			if (curr)
				curr.model = curr.letter;
		} else {
			var curr = vowelStack.shift();
			if (curr)
				curr.model = curr.letter;
		}
	};

	this.drawFriendly = function() {

		console.log('goal steps ' + self.fitbitData.goals.steps);

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
		setInterval(function() {
			console.log('in the draw circle func.');

			var date = new Date(),
	        h = date.getHours(),
	        m = date.getMinutes(),
	        s = date.getSeconds();

			self.fitbitData.time = gameService.updateTime(24-h);
			
			console.log('hours is ' + h);


	    if (dh !== h) {
	    	self.friendlyProgress.radialMultiProgress("to", {
	      		"index": 0, 'perc': self.fitbitData.steps, 'time': (self.fitbitData.steps ? 100 : 10)
	      	});
	    	dh = h;
	    }
	    if (dm !== m) {
	    	self.friendlyProgress.radialMultiProgress("to", {
	    		"index": 1, 'perc': self.fitbitData.floors, 'time': (self.fitbitData.floors ? 100 : 10)
	    	});
	    	dm = m;
	    }
	    if (ds !== s) {
	    	self.friendlyProgress.radialMultiProgress("to", {
	    		"index": 2, 'perc': h, 'time': (s ? 100 : 10)
	    	});
	    	ds = s;
	    }
	  }, 1000);
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

		self.queryInterval = $interval( function(){ gameService.getFitbitData();} , 35000);
	
		$timeout( self.drawFriendly, 750);
	});
});
