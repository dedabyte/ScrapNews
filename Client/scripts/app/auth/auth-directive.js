(function(){

  'use strict';

  var componentName = 'snAuth';

  angular
    .module('app')
    .directive(componentName, function(Server, Auth, LogService, $http){
      return {
        controllerAs: componentName,
        template:
          '<p><h3>login</h3></p>' +
          '<p><input id="user" type="text" placeholder="user" ng-model="snAuth.user"/></p>' +
          '<p><input id="pass" type="password" placeholder="pass" ng-model="snAuth.pass"/></p>' +
          '<p><button ng-click="snAuth.login()" ng-disabled="!snAuth.user || !snAuth.pass">Login</button></p>',
        controller: function(){
          var self = this;

          function login(){
            $.ajax({
              type: 'POST',
              url: 'http://localhost:54861/api/authenticate',
              data: {
                user: self.user,
                pass: self.pass
              },
              success: function (response) {
                if (response.error) {
                  console.error(response.message);
                  return;
                }
                //location.reload(true);
              }
            });
          }

          self.login = login;
        }
      };
    });

})();
