angular.module('app.details', [])
.controller('DetailsController', function($scope, route, LocationService, userLocation, RestBusService, MapService, VehiclesService, YelpService, SimpleAuthService, FirebaseService) {
  var authData = SimpleAuthService.authData;
  if (authData) {
    $scope.userId = authData.uid;
  }
  //helpers
  //stop here has potentially marker, infoWindow, and yelpData properties
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


  $scope.addStopMarkers = function(stops, hasUser) {
    var stopMapData = [];
    stops.forEach(function(stop, index) { //has to be inside cb to ensure isVisited set for now (deal with setVisited promise to fix)
      if (hasUser && $scope.visitedStops.indexOf(stop.id) > -1) imgName = 'stopVisited';
      else imgName = 'stop';
      var marker = MapService.createMarker($scope.map, {latitude: stop.lat, longitude: stop.lon}, './img/'+imgName+'.png');
      stopMapData.push({marker: marker});

      //create event listener
      google.maps.event.addListener(marker, 'click', function() {
        var s = _.find(stopMapData, function(stop) { //ugh
          if (stop.marker === marker) return stop;
        });
        if (!s.yelpData) {
          YelpService.getLocalBusinesses({lat: stop.lat, lon: stop.lon}, function(data) {
            s.yelpData = data;
            showWindow(s);
          });
        } else { //ugh
          showWindow(s);
        }
      });
    });
  };

  RestBusService.getRouteDetailed(route.route.id) //since the app.details stateparams only use the uniqId for now, it doesn't have the route info so we can't do it all in the app.js router part like they did for route
  .then(function(data) {
    $scope.stops = data.stops;

    RestBusService.getStationLocation($scope.map, route, $scope.stops, function() { //TODO refactor
      var imgName = 'stop';

      $scope.stationMarker = MapService.createMarker($scope.map, RestBusService.closestStop.loc, './img/station.png');

      if ($scope.userId) {
        $scope.visitedStops = [];
        FirebaseService.visitStop(route.route.id, $scope.userId, RestBusService.closestStop.id); //user optionally logged in
        FirebaseService.getVisitedStops(route.route.id, $scope.userId).then(function(stops) {
          stops.forEach(function(stop) {
            $scope.visitedStops.push(stop.$id);
          });

          $scope.addStopMarkers(data.stops, true);
        });
      } else {
        $scope.addStopMarkers(data.stops, false);
      }
    });

    //polylines
    MapService.createRouteLine(data.stops.map(function(stop) {
      return [stop.lat, stop.lon];
    }), $scope.map);
  });

  $scope.route = route;
  $scope.userLocation = userLocation;
  $scope.map = MapService.createMap($scope.userLocation);
  $scope.userMarker = MapService.createMarker($scope.map, $scope.userLocation, './img/user.png');
  $scope.vehicleMarkers = MapService.displayVehicles($scope.map, $scope.route, './img/bus.png');

  //Called from ionic pulldown refresh
  $scope.doRefresh = function() {
    //MapService.refreshStationMarker($scope.stationMarker);
    MapService.refreshUserMarker($scope.userMarker);
    MapService.refreshVehicleMarkers($scope.vehicleMarkers);
    //if (userId) FirebaseService.visitStop(route.route.id, userId, RestBusService.closestStop.id); //user optionally logged in

    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.drawLine = function(){
    var routeId = $scope.route.route.id;
    $.ajax({
      url: "http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r="+routeId,
      dataType:"xml"
    }).done(function(xmlData){
      var jsonData = xml.xmlToJSON(xmlData);
      console.dir(jsonData);
      var path = jsonData.body.route.path;
      for(var i = 0; i< path.length; i++){
        var point = path[i].point;
        var stopLocs = [];
        for (var j = 0; j < point.length; j++) {
          stopLocs.push([point[j]['@lat'],point[j]['@lon']]);
        }
        MapService.createRouteLine(stopLocs,$scope.map);

      }
    });
  };
  $scope.drawLine();
  //Initial page load
  $scope.doRefresh();

});
