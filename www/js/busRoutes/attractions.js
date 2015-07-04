angular.module('app.attractions', [])
	
	.controller('AttractionsController', function($scope, route, FirebaseService, RestBusService){
		$scope.route = route;


		console.log('init');
		FirebaseService.getStopScore($scope.route, function(item){
			$scope.scores = item;
		});

	});
