angular.module('fitness.game', [])

.controller('GameCtrl', function($ionicPopup) {
	var vm = this;

	var data = "whats good for the goose is good for the gander";
	data = data.toUpperCase();
	var parts = data.split(" ");
	vm.phrase = [];
	vm.answer = [];
	parts.forEach(function(d) {
		vm.phrase.push(d.split(''));
		var temp = [];
		for(var i = 0; i < d.length; i++) {
			temp.push('*')
		}
		vm.answer.push(temp)
	});

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
