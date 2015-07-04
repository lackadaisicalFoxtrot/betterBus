angular.module('app.leaderboard', [])
	

	.controller('LeaderboardController', function($scope, route, FirebaseService, RestBusService){




		FirebaseService.getStopScore($scope.route, function(item){
			$scope.scores = item;
		});

		$scope.route = route;


	});

