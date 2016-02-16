(function(){

  'use strict';

  var componentName = 'snAuth';

  angular
    .module('scrapper')
    .directive(componentName, function(){
      return {
        controllerAs: componentName,
        template:
          '<form class="login-form" ng-submit="snAuth.login()">' +
          '<p><input id="user" type="text" placeholder="Username" ng-model="snAuth.user" autofocus/></p>' +
          '<p><input id="pass" type="password" placeholder="Password" ng-model="snAuth.pass"/></p>' +
          '<p class="login-error" ng-bind="snAuth.errorMessage" ng-show="snAuth.errorMessage"></p>' +
          '<p><button type="submit" ng-disabled="!snAuth.user || !snAuth.pass">Login</button></p>' +
          '</form>',
        controller: function($scope, LogService){
          var self = this;

          self.errorMessage = '';

          function login(){
            $.ajax({
              type: 'POST',
              url: window.api + '/authenticate',
              data: {
                user: self.user,
                pass: self.pass
              },
              success: function (response) {
                if (response.error) {
                  LogService.error(response.message);
                  $scope.$evalAsync(function(){
                    self.errorMessage = response.message;
                  });
                  return;
                }
                self.errorMessage = '';
                localStorage.setItem('sn-token', response.data.token);
                location.reload(true);
              },
              error: function(error){
                LogService.error(error);
                $scope.$evalAsync(function(){
                  self.errorMessage = 'Error. See console for more info.';
                });
              }
            });
          }

          self.login = login;
        }
      };
    });

})();
