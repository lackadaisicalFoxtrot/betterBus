angular.module('app.details', [])

  .controller('DetailsController', function($scope, $state, route, LocationService, userLocation, RestBusService, MapService, VehiclesService, YelpService) {
    RestBusService.getRouteDetailed(route.route.id) //since the app.details stateparams only use the uniqId for now, it doesn't have the route info so we can't do it all in the app.js router part like they did for route
    .then(function(data) {
      $scope.stops = data.stops;
      $scope.stopMarkers = [];
      data.stops.forEach(function(stop, index) {
        //omg mapservice is horribly WET... ikr smh lolz
        $scope.stopMarkers[index] = MapService.createMarker($scope.map, {latitude: stop.lat, longitude: stop.lon}, './img/stop.png');

        //create event listener
        google.maps.event.addListener($scope.stopMarkers[index], 'click', function() {
          debugger;
          YelpService.getLocalBusinesses({latitude: stop.lat, longitude: stop.lon}, function(data) {
            console.log(data);
            var place = data[YelpService.feelingLucky(data.length)];
            new google.maps.InfoWindow({
              content: YelpService.formatData(place)
            }).open($scope.map, $scope.stopMarkers[index]);
          });
        });
      });
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
    //
    $scope.vehicleMarkers = MapService.displayVehicles($scope.map, $scope.route, './img/bus.png');
    //
    RestBusService.getStationLocation($scope.map, route, './img/station.png');
    
    //Called from ionic pulldown refresh
    $scope.doRefresh = function() {
      MapService.refreshUserMarker($scope.userMarker);
      MapService.refreshVehicleMarkers($scope.vehicleMarkers);

      $scope.$broadcast('scroll.refreshComplete');
    };

    //this is different way to change app state than what is already present...refer to menu.html
    //injected $state into controller in arguments list
    
   




    //Initial page load
    $scope.doRefresh();

  });


//testStops will include mock testStops
//mock 

//need to display yelp icon