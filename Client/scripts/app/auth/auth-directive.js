(function(){

  'use strict';

  var componentName = 'snAuth';

  angular
    .module('app')
    .directive(componentName, function(){
      return {
        controllerAs: componentName,
        template:
          '<form class="login-form" ng-submit="snAuth.login()">' +
          '<p><input id="user" type="text" placeholder="Username" ng-model="snAuth.user" autofocus/></p>' +
          '<p><input id="pass" type="password" placeholder="Password" ng-model="snAuth.pass"/></p>' +
          '<p><button type="submit" ng-disabled="!snAuth.user || !snAuth.pass">Login</button></p>' +
          '</form>',
        controller: function(){
          var self = this;

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
                  console.error(response.message);
                  return;
                }
                localStorage.setItem('sn-token', response.data.token);
                location.reload(true);
              }
            });
          }

          self.login = login;
        }
      };
    });

})();
