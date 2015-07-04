angular.module('app.attractions', [])
	
	.controller('AttractionsController', function($scope, route, FirebaseService, RestBusService){
		
		console.log('has loaded');

		$scope.route = route;



		FirebaseService.getStopScore($scope.route, function(item){
			$scope.scores = item;
			console.log('this should be scores', $scope.scores);
		});

	});

	/*
  this.getStopScore = function(routeId){
    //var route = $firebaseObject(new Firebase('http://betterbus.com/routes/'+routeId+'.json'));
    var route = new Firebase('https://betterbus.firebaseio.com/routes/' + routeId);
    var scores = {};
      route.orderByValue().on("value", function(snapshot) {
        snapshot.forEach(function(data) {

          var val = data.val();
          var key = data.key();
          scores[key] = val;
        });

        console.log('yba', scores);
        return scores;
      });
  
	*/