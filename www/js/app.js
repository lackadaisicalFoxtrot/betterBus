angular.module('app', [
    'ionic',
    'ui.router',
    'app.home',
    'app.details',
    'app.services',
    'angular-toArrayFilter',
    'app.auth',
    'app.leaderboard',
    'app.filters', 
    'firebase'
  ])
  /**
   * Class that begins ionic and cordova.
   * @file
   */
  .run(function($ionicPlatform, $rootScope, $ionicLoading) {
    // Default loading screen with spinner during http reqeust
    $rootScope.$on('loading:show', function(){
      $ionicLoading.show({template: '<ion-spinner icon="lines" class="spinner-balanced"></ion-spinner>'})
    });
    $rootScope.$on('loading:hide', function() {
      $ionicLoading.hide()
    });


    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

  .config(function($stateProvider, $urlRouterProvider, $httpProvider) {

    // Default loading screen with spinner during http reqeust
    $httpProvider.interceptors.push(function($rootScope) {
      return {
        request: function(config) {
          $rootScope.$broadcast('loading:show');
          return config;
        },
        response: function(response) {
          $rootScope.$broadcast('loading:hide');
          return response;
        }
      }
    });

    // Send to home if route is not found
    $urlRouterProvider.otherwise('/routes');

    $stateProvider
      .state('app', {
        url: '',
        abstract: true,
        templateUrl: 'menu.html',
        controller: 'AppController'
      })
      .state('app.routes', {
        url: '/routes',
        views: {
          'menuContent': {
            templateUrl: 'js/busRoutes/home.html',
            controller: 'HomeController'
          }
        },
        // the resolve option will wait for the results an async function and pass the results to the controller on
        // state change. Learn more at http://learn.ionicframework.com/formulas/data-the-right-way/
        resolve: {
          routes: function(RestBusService) {
            return RestBusService.getRoutes();
          }
        }
      })
      .state('app.details', {
        url: '/routes/:uniqId',
        views: {
          'menuContent': {
            templateUrl: 'js/busRoutes/details.html',
            controller: 'DetailsController'
          }
        },
        resolve: {
          route: function($stateParams, RestBusService) {
            return RestBusService.getRoute($stateParams.uniqId);
          },

          //routeDetailed: function($stateParams, RestBusService) { //this has the detailed route info, inc all stops. need prev?
            //return RestBusService.getRouteDetailed($stateParams.uniqId);
            ////state params etc?
          //},

          userLocation: function(LocationService) { 
            return LocationService.getCurrentLocation();
          }
        }
      })
       .state('app.login', {
         url: '/login',
         views: {
           'menuContent': {
             templateUrl: 'js/auth/login.html'
           }
         }
       })
       .state('app.signup', {
         url: '/signup',
         views: {
           'menuContent': {
             templateUrl: 'js/auth/signup.html'
           }
         }
       })
      .state('app.filters', {
        url: '/filters', 
        views: {
          'menuContent': {
            templateUrl: 'js/filter/filter.html', 
            controller: 'FilterController'
          }
        }
      })

      .state('app.leaderboard', {
        url: '/leaderboard/:uniqId', //TODO restful (/:routeid/leaderboard)

        views: {
          'menuContent': {
            templateUrl: 'js/busRoutes/leaderboard.html',
            controller: 'LeaderboardController'
          }
        },
        resolve: {
          route: function($stateParams, RestBusService) {
            return $stateParams.uniqId;
          }
        }
      });
  })
  .controller('AppController', function($scope){
  })
