angular.module('app.leaderboard', [])
	

	.controller('LeaderboardController', function($scope, route, FirebaseService, RestBusService){

		$scope.route = route;
		FirebaseService.getStopScore($scope.route, function(item){
			$scope.scores = item;
		});

		


	});

