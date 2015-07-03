angular.module('app.details', [])
.controller('DetailsController', function($scope, route, LocationService, userLocation, RestBusService, MapService, VehiclesService, YelpService, SimpleAuthService, FirebaseService) {
  var authData = SimpleAuthService.authData;
  if (authData) {
    $scope.userId = authData.uid;
    //FirebaseService.
  }

  RestBusService.getRouteDetailed(route.route.id) //since the app.details stateparams only use the uniqId for now, it doesn't have the route info so we can't do it all in the app.js router part like they did for route
  .then(function(data) {
    $scope.stops = data.stops;

    RestBusService.getStationLocation($scope.map, route, $scope.stops, function() { //ugh refactor still needed, buncha shit together TODO but necessary this way for now
      var imgName = 'stop';
      if ($scope.userId) {
        FirebaseService.visitStop(route.route.id, $scope.userId, RestBusService.closestStop.id); //user optionally logged in
        FirebaseService.getVisitedStops().then(function(stops) {
          console.log(stops); //incorrect TODO;
          //debugger;
        });
      }
      $scope.stationMarker = MapService.createMarker($scope.map, RestBusService.closestStop.loc, './img/station.png');

      var stopMapData = [];

      //helpers
      //stop here is the stopData[i] that has a marker, infoWindow, and yelpData (inprogress) associated
      var makeWindow = function(stop) {
        var place = stop.yelpData[YelpService.feelingLucky(stop.yelpData.length)];
        if (!stop.infoWindow) {
          stop.infoWindow = new google.maps.InfoWindow({
            content: YelpService.formatData(place)
          });
        } else {
          stop.infoWindow.setContent(YelpService.formatData(place));
        }
      };
      var showWindow = function(stop) {
        makeWindow(stop); //ugh DRY pls
        stop.infoWindow.open($scope.map, stop.marker);
      };

      data.stops.forEach(function(stop, index) { //has to be inside cb to ensure isVisited set for now (deal with setVisited promise to fix)
        //if (userId && visitedStops[stop.id]) imgName = 'stopVisited';
        //
        //if (userId) {
        //var isVisited = FirebaseService.checkVisited(route.route.id, userId, RestBusService.closestStop.id)
        //debugger;
        //.then(function(isVisited) {
        //if (isVisited) imgName = 'stopVisited';
        //});
        //}
        var marker = MapService.createMarker($scope.map, {latitude: stop.lat, longitude: stop.lon}, './img/'+imgName+'.png');
        stopMapData.push({marker: marker});
        //create event listener
        google.maps.event.addListener(marker, 'click', function() {
          var s = _.find(stopMapData, function(stop) { //ugh
            if (stop.marker === marker) return stop;
          });
          if (!s.yelpData) {
          debugger;
            YelpService.getLocalBusinesses({lat: stop.lat, lon: stop.lon}, function(data) {
              console.log(data);
              debugger;
              s.yelpData = data;
              showWindow(s);
            });
          } else { //ugh
            showWindow(s);
          }
          //console.log(data);
          //$scope.stopMarkers[index].infoWindow.setContent(YelpService.formatData(place));
          //$scope.stopMarkers[index].infoWindow.open($scope.map, this);
        });
    });

    //polylines. this is iterating through all the stops again...
    MapService.createRouteLine(data.stops.map(function(stop) {
      return [stop.lat, stop.lon];
    }), $scope.map);
    //google.maps.event.addDomListener(window, 'load'); //TODO why
  });
  //$scope.stops = data.stops;
  //_.pluck(data.stops, 
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
$scope.userLocation = userLocation;
$scope.map = MapService.createMap($scope.userLocation);
$scope.userMarker = MapService.createMarker($scope.map, $scope.userLocation, './img/user.png');
$scope.vehicleMarkers = MapService.displayVehicles($scope.map, $scope.route, './img/bus.png');

//Called from ionic pulldown refresh
$scope.doRefresh = function() {
  //MapService.refreshStationMarker($scope.stationMarker);
  MapService.refreshUserMarker($scope.userMarker);
  MapService.refreshVehicleMarkers($scope.vehicleMarkers);
  //debugger;
  //if (userId) FirebaseService.visitStop(route.route.id, userId, RestBusService.closestStop.id); //user optionally logged in

  $scope.$broadcast('scroll.refreshComplete');
};

//Initial page load
$scope.doRefresh();

});


//testStops will include mock testStops
//mock 

//need to display yelp icon
