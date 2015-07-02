angular.module('app.details', [])

  .controller('DetailsController', function($scope, route, LocationService, userLocation, YelpService, RestBusService, MapService, VehiclesService) {
    RestBusService.getRouteDetailed(route.route.id) //since the app.details stateparams only use the uniqId for now, it doesn't have the route info so we can't do it all in the app.js router part like they did for route
    .then(function(data) {
      $scope.stops = data.stops;
      data.stops.forEach(function(stop) {
        //omg mapservice is horribly WET
        $scope.stopMarkers = MapService.createMarker($scope.map, {latitude: stop.lat, longitude: stop.lon}, './img/stop.png');
        //console.log(stop.lat, stop.lon);
      });
      //debugger;
    });
    $scope.route = route;
    //testing for yelp
    // RestBusService.getRouteDetailed(route.route.id)
    // .then(function(data){
    //   console.log(data);
    //   YelpService.getYelpForRoute(data, function(results){
    //     console.dir(results);
    //   });
    // });
    //end testing
    $scope.userLocation = userLocation;
    $scope.map = MapService.createMap($scope.userLocation);
    $scope.userMarker = MapService.createMarker($scope.map, $scope.userLocation, './img/user.png');
    $scope.vehicleMarkers = MapService.displayVehicles($scope.map, $scope.route, './img/bus.png');
    RestBusService.getStationLocation($scope.map, route, './img/station.png');
    
    //Called from ionic pulldown refresh
    $scope.doRefresh = function() {
      MapService.refreshUserMarker($scope.userMarker);
      MapService.refreshVehicleMarkers($scope.vehicleMarkers);

      $scope.$broadcast('scroll.refreshComplete');
    };
    //Initial page load
    $scope.doRefresh();

  });
