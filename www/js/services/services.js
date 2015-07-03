/**
 * Module that contains all the services
 * @module
 */

angular.module('app.services', ['ngCordova'])


.service('LocationService', function($cordovaGeolocation, $ionicPlatform, $ionicPopup, $q) {
  /** 
   * Takes a callback whose first argument contains current location. Displays an error to the user if location cannot be found.
   * @param {func} callback - The function that recieves the lat and long
   */
  this.getCurrentLocation = function() {
    var options = {
      timeout: 10000,
      enableHighAccuracy: false
    };
    // Note: cordova plugins must be wrapped in document.ready or $ionicPlatforml.ready
    var dfd = $q.defer();

    $ionicPlatform.ready(function() {
      $cordovaGeolocation.getCurrentPosition(options)
      .then(function(position) {
        dfd.resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      }, function(err) {
        console.log(err);
      });
    });

    return dfd.promise;
  };

})

.service('FirebaseService', function($firebaseObject){
  //this.update = function(routeId, userId) {
  //var routeRef = new Firebase('https://betterbus.firebaseio.com/routes/'+routeId);
  //var userRef = new Firebase('https://betterbus.firebaseio.com/users/'+userId);
  //userRef.
  //routeref.update(userId, num_stops);
  //};
  //this.setNumStops = function(numStops, routeId, userId){
  //var routeUserRef = new Firebase('https://betterbus.firebaseio.com/routes/'+routeId+'/'+userId);
  //var numStops = numStops || 0;
  //routeUserRef.set(num_stops || 0);
  //};
  //routeref.update({userId: });
  //var route = $firebaseObject(new Firebase('https://betterbus.firebaseio.com/routes/'+routeId));
  //route.$loaded(function(data){
  //route[userId] = stops;
  //route.$save();
  //},function(err){
  //console.log('error getting route firebase');
  //});

  this.visitStop = function(routeId, userId, stopId){
    var userRouteStop = $firebaseObject(new Firebase('https://betterbus.firebaseio.com/users/'+userId+'/routes/'+routeId+'/'+stopId));
    if (userRouteStop.$value) return; //already visited stop before
    userRouteStop.$value = true;
    userRouteStop.$save(); //TODO deal with promise 

    //redundantish data but easier to find
    var routeUser = $firebaseObject(new Firebase('https://betterbus.firebaseio.com/routes/'+routeId+'/'+userId));
    //val is the num stops
    routeUser.$value = routeUser.$value || 0;
    routeUser.$value++;
    routeUser.$save();
  };

  //this.checkVisited = function(routeId, userId, stopId) {
  //var userRouteStop = $firebaseObject(new Firebase('https://betterbus.firebaseio.com/users/'+userId+'/routes/'+routeId+'/'+stopId));
  //return userRouteStop.$loaded().then(function(data) { //TODO research loaded more and best prac. always load and deal with save promises?
  //debugger;
  //return (data.$value);
  //});
  //};

  this.getVisitedStops = function(routeId, userId){
    debugger;
    var stops = $firebaseObject(new Firebase('https://betterbus.firebaseio.com/users/'+userId+'/routes/'+routeId));
    return stops.$loaded(function(data){
      return data;
    });
  };
})



.service('YelpService',function($http,LocationService, ReadFileService){

  this._readConfigData = function() {
    if (this.configData) return;
    ReadFileService.readFile('../config.json').then(function(data){  //omg this is making an http request to read a file?
      this.configData = data;
      debugger;
    });
  };
  this.getLocalBusinesses = function(loc,callback) {
    var that= this;
    var randomString = function(length, chars) {
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    };
      var auth = this.configData;
      var url = 'http://api.yelp.com/v2/search';
      var params = {
        term: 'food',
        callback: 'angular.callbacks._0',
        ll: loc.latitude+','+loc.longitude,
        // location: 'San+Francisco',
        oauth_consumer_key: auth.oauth_consumer_key, //Consumer Key
        oauth_token: auth.oauth_token, //Token
        oauth_signature_method: auth.oauth_signature_method,
        oauth_timestamp: Date.now(), //faster
        oauth_version: '1.0',
        oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
      };
      var signature = oauthSignature.generate('GET', url, params, auth.oauth_consumer_secret, auth.oauth_token_secret, { encodeSignature: true});
      params.oauth_signature = signature;
      $http.jsonp(url,{params:params}).success(function(data){
        debugger;
        console.log(data);
        that.parseData(data,callback);
      });
  };

  this.parseData = function(data,callback) {
    callback(data.businesses);
  };

  //return random number
  this.feelingLucky = function(length) {
    return Math.floor(Math.random()*length);
  };

  //create info window
  this.formatData = function(item) {
    return '<h4>' + item.name + '</h4>' +
      '<h5>' + item.location.address[0] + '</h5>' +
      '<img src="' + item.image_url + '"/>' +
      '<h5>Phone: <a href="tel:' + item.phone + '">' + item.phone + '</a></h5>' +
      '<img src="' + item.rating_img_url_small + '"/>' +
      '<h5>Number of Reviews: ' + item.review_count +'</h5>'
  };

})

.service('RestBusService', function($http, $q, $ionicLoading, LocationService, ReadFileService, MapService) {
  /** 
   * Gets the stations that are closest in proximity to the user 
   * @param {object} latlon - Object with a latitude and longitude of user
   */
  var routes = [];
  this.getRouteDetailed = function(route) {
    return $http({
      url: 'http://localhost:3000/agencies/sf-muni/routes/'+route, //get route detailed info inc all the stops
      method: 'GET'
    }).then(function(data) {
      return data.data;
    });
  };

  this.getRoutes = function() {
    var dfd = $q.defer();

    LocationService.getCurrentLocation().then(function(latlon){
      // Change url to your own deployed API. See more instructions on README.md
      $http({
        url: 'http://localhost:3000/locations/' + latlon.latitude + ',' + latlon.longitude + '/predictions',
        method: 'GET'
      }).success(function(data) {
        routes = data;
        dfd.resolve(data);
      });

    });

    return dfd.promise;
  };

  // this.getStops = function(){
  //   var dfd = $q.defer();
  //   var routes = [];

  // }
  /** 
   * Gets the route information from the route clicked on the home screen 
   * @param {string} uniqId - String from url
   */
  this.getRoute =  function(uniqId) {
    var dfd  = $q.defer();
    routes.forEach(function(route) {
      if (route.stop.id + route.route.id === uniqId) {
        dfd.resolve(route);
      }
    });
    return dfd.promise;
  };

  /** 
   * Gets the latitude and longitude of a specific stop by route 
   * @param {object} map - Instance of google maps map
   * @param {object} route - Current selected route
   * @param {string} image - path to image file
   */

  this.getStationLocation = function(map, route, stops, cb) { //TODO refactor no need cb
    var stop = _.find(stops, function(stop) { return stop.id === route.stop.id });
    this.closestStop = {id: route.stop.id, loc: {latitude: stop.lat, longitude: stop.lon}};
    cb();

  };

})

.service('VehiclesService', function($http) {

  /** 
   * Gets the list of vehicles by agency from the restbus API
   */
  this.getVehicles = function() {
    return $http({
      // Change url to your own deployed API. See more instructions on README.md
      url: 'http://localhost:3000/agencies/sf-muni/vehicles',
      method: 'GET'
    });
  };
})

/////--> this is the service which will pull down interest data <--\\\\\\

// .service('AttractionsService', function($http){

//   this.getAttractionData = function(url, method){
//     return $http({
//       url: url,
//       method: method
//     });
//   };
// })

.service('ReadFileService', function($http) {

  /**
   * Read a specific file
   * @param {string} loc - location of file
   */
  this.readFile = function(loc) { //get rid of this please, refactor
    return $http({
      url: loc,
      method: 'GET'
    });
  };

})

.service('MapService', function(LocationService, VehiclesService) {

  /**
   * Creates a google maps map
   * @param {object} loc - Contains latitude and longitude where the map should be centered
   */
  this.createMap = function(loc) {
    // var sanFran = {lat: 37.78, lng: -122.416}
    var mapOptions = {center: {lat: loc.latitude, lng: loc.longitude}, zoom: 17};
    return new google.maps.Map(document.getElementById('mapContainer'), mapOptions);
  };
  //takes array of twopals lat/long and the map
  this.createRouteLine= function(locArray,map){
    var googleCoords = [];
    for (var i = 0; i < locArray.length; i++) {
      googleCoords.push(new google.maps.LatLng(locArray[i][0],locArray[i][1]));
    }
    var line = new google.maps.Polyline({
      path: googleCoords,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    line.setMap(map);
  };
  /**
   * Creates a marker on a google maps map
   * @param {object} map - Instance to place markers on
   * @param {object} loc - Object with a latitude and longitude of marker
   * @param {string} image - file path of image to use
   */
  this.createMarker = function(map, loc, image) {
    return new google.maps.Marker({
      position: new google.maps.LatLng(loc.latitude, loc.longitude),
      map: map,
      icon: image
    });
  };

  this.getDirection = function(heading) {
    var directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.floor(heading/45)];
  };

  /**
   * Creates a marker on a google maps map
   * @param {object} map - Instance to place markers on
   * @param {string} - vehicle id
   * @param {object} loc - Object with a latitude and longitude of vehicle
   * @param {string} image - file path of image to use
   */


  this.displayVehicle = function(map, vehicle, image) {
    var vehicleMarker = {
      marker: this.createMarker(map, {latitude: vehicle.lat, longitude: vehicle.lon}, image),
      id: vehicle.id
    };

    var direction = this.getDirection(vehicle.heading);
    var directionContent = '<h4>Direction: ' + direction + '</h4>';

    var infoWindow = new google.maps.InfoWindow({
      content: directionContent
    });

    var toggle = function() {
      if(vehicleMarker.marker.icon === './img/bus.png') {
        infoWindow.open(map, vehicleMarker.marker);
        vehicleMarker.marker.icon = './img/arrow/arrow_' + direction + '.png';
      } else {
        vehicleMarker.marker.icon = './img/bus.png';
        infoWindow.close();
      }

      //refresh the marker on map
      vehicleMarker.marker.setMap(null); vehicleMarker.marker.setMap(map);
    };

    google.maps.event.addListener(vehicleMarker.marker, 'click', function() {
      toggle();
    });

    return vehicleMarker;
  };

  /**
   * Creates a marker on a google maps map
   * @param {object} map - Instance to place markers on
   * @param {object} loc - Object with route information
   * @param {string} image - file path of image to use
   */
  this.displayVehicles = function(map, route, image) {
    var markersArray = [];

    //put vehicles on map
    VehiclesService.getVehicles()
    .then(function(data) {
      var vehicles = data.data;
      var routeId = route.route.id;

      for(var i = 0, len = vehicles.length; i < len; i++) {
        if(vehicles[i].routeId === routeId) {
          markersArray.push(this.displayVehicle(map, vehicles[i], image));
        }
      }
    }.bind(this));

    return markersArray;
  };

  //this.refreshStationMarker = function(marker){
  //if (!marker) return;
  //this.getStationLocation(
  //marker.setPosition(new google.maps.LatLng(data.latitude, data.longitude));
  //RestBusService.getStationLocation(map, route);
  //};

  /**
   * refresh user marker location
   * @param {object} marker
   */
  this.refreshUserMarker = function(marker){
    if(marker === undefined) {
      return ;
    }

    // change position of user using new lat lng
    LocationService.getCurrentLocation()
    .then(function(data){
      marker.setPosition(new google.maps.LatLng(data.latitude, data.longitude));
    });
  };

  /**
   * refresh locations of markers in an array of markers
   * @param {array} markers
   */
  this.refreshVehicleMarkers = function(markers){
    if(markers === undefined) {
      return ;
    }

    var vehicleMarkers = {};

    VehiclesService.getVehicles()
    .then(function(data){
      var vehicles = data.data;

      // add route vehicles to object
      for(var i = 0, len = markers.length; i < len; i++) {
        vehicleMarkers[markers[i].id] = markers[i];
      }

      // change position of vehicle makers using new lats and lngs
      for(var j = 0, len2 = vehicles.length; j < len2; j++) { 
        if(vehicleMarkers[vehicles[j].id]) {
          var lat = vehicles[j].lat;
          var lng = vehicles[j].lon;
          vehicleMarkers[vehicles[j].id].marker.setPosition(new google.maps.LatLng(lat, lng));
        }
      }
    });

  };

})
.service('SimpleAuthService', function($firebaseAuth){ //for quick mockup purposes, top level firebase
  var ref = new Firebase('https://betterbus.firebaseio.com');
  //auth = $firebaseAuth(ref);
  this.createUser = function(e, pw, cb) { //auth.$createUser
    ref.createUser({
      email    : e,
      password : pw
    }, function(error, userData) {
      if (error) {
        console.log("Error creating user:", error);
      } else {
        console.log("Successfully created user account with uid:", userData.uid);
        cb();
      }
    });
  };
  this.loginUser = function(e, pw, success, err) {
    //or auth.$authWithPassword
    ref.authWithPassword({
      email    : e,
      password : pw
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
        err();
      } else {
        ref.child('users').child(authData.uid).update({email: authData.password.email});
        console.log("Authenticated successfully with payload:", authData);
        this.authData = authData;
        success();
      }
    }.bind(this));
  };
  //this.getUserId = function() {
  //return this.userId; //TODO fix global
  //};
})
.service('FilterService', function($firebaseArray){
  var filtersRef = new Firebase('https://betterbus.firebaseio.com/filters');
  return $firebaseArray(filtersRef);
});


