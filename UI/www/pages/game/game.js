angular.module('fitness.game', [])

.controller('GameCtrl', function($ionicPopup) {
	var vm = this;
	var vowels = ['A', 'E', 'I', 'O', 'U'];
	var numVowels = 0;
	var numCons = 0;
	var vowelStack, consStack;

	var data = "The rain in spain falls mainly on the plain";
	data = data.toUpperCase();

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

	orderVowels = shuffleArray(orderVowels);
	orderCons = shuffleArray(orderCons);

	vowelStack = new Array(numVowels);
	consStack = new Array(numCons);

	var parts = data.split(" ");
	vm.phrase = [];
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
		vm.phrase.push(temp)
	});

	// button click handler, exhausts vowels first, then consonants
	vm.reveal = function() {
		if(vowelStack.length == 0) {
			var curr = consStack.shift();
			curr.model = curr.letter;
		} else {
			var curr = vowelStack.shift();
			curr.model = curr.letter;
		}
	};

	// stole this from http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	function shuffleArray(array) {
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	}

	var friendlyProgress = jQuery("#friend-progress").radialMultiProgress("init", {
		'fill': 25,
		'font-size': 14,
		'size': 100,
		'data': [
			{'color': "#2DB1E4", 'range': [0, 12]},
			{'color': "#9CCA13", 'range': [0, 59]},
			{'color': "#A4075E", 'range': [0, 59]}
		]
	});

	var drawFriendly = function() {
		var dh, dm, ds;
		setInterval(function() {
			var date = new Date(),
	        h = date.getHours() % 12,
	        m = date.getMinutes(),
	        s = date.getSeconds();
	    if (dh !== h) {
	    	friendlyProgress.radialMultiProgress("to", {
	      		"index": 0, 'perc': h, 'time': (h ? 100 : 10)
	      	});
	    	dh = h;
	    }
	    if (dm !== m) {
	    	friendlyProgress.radialMultiProgress("to", {
	    		"index": 1, 'perc': m, 'time': (m ? 100 : 10)
	    	});
	    	dm = m;
	    }
	    if (ds !== s) {
	    	friendlyProgress.radialMultiProgress("to", {
	    		"index": 2, 'perc': s, 'time': (s ? 100 : 10)
	    	});
	    	ds = s;
	    }
	  }, 1000);
	};
	drawFriendly();
});
