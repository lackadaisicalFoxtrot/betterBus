angular.module('app.leaderboard', [])
	

	.controller('LeaderboardController', function($scope, route, FirebaseService, RestBusService){

		
		console.log('has loaded');

		$scope.route = route;



		FirebaseService.getStopScore($scope.route, function(item){
			$scope.scores = item;
			console.log('this should be scores', $scope.scores);
		});

	});


