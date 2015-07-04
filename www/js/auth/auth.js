angular.module('app.auth', ['ionic'])

.factory('LoginFactory', function($state, $ionicPopup) {
  var methods = {};
  methods.success = function() {
    $state.go('app.routes');
  };
  methods.error = function() {
    $ionicPopup.alert({
           title: 'Login Failed!',
           template: 'Please check your username/password, or go to the signup page.'
         });
  };
  return methods;
})

.controller('LoginController', function($scope, SimpleAuthService, $state, LoginFactory) {
  $scope.submit = function() {
    SimpleAuthService.loginUser($scope.email, $scope.password, LoginFactory.success, LoginFactory.error);
  };
})

.controller('SignupController', function($scope, SimpleAuthService, $state, LoginFactory) {
  $('.passwordPopup').toggle(false);
  $('.emailPopup').toggle(false);

  $scope.regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  $scope.submit = function() {
    $('.passwordPopup').toggle(false);
    $('.emailPopup').toggle(false);
    var email = true;
    if(!$scope.regex.test($scope.email)){
      console.log('wrong email');
      $('.emailPopup').toggle(true);
      email=false;
    }
    if($scope.password===$scope.confirmPassword && email){

      SimpleAuthService.createUser($scope.email, $scope.password, function() {
        SimpleAuthService.loginUser($scope.email, $scope.password, LoginFactory.success, LoginFactory.error);
    });
    }
    else if($scope.password!==$scope.confirmPassword){
      $('.passwordPopup').toggle(true);
    }

  };
});
