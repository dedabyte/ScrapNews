(function(){

  'use strict';

  angular
    .module('app')
    .service('Auth', Auth);

  function Auth(Server, LogService, EventsService, ConfirmationDialog, $rootScope, $compile){
    var self = this;

    function getUserProfile(){
      ConfirmationDialog.closeAll();
      Server.userProfile().then(
        function(response){
          self.userProfile = response.data;
          EventsService.publish('sn-login', self.userProfile);
        },
        function(error){
          ConfirmationDialog.open({
            title: 'Login',
            width: 256,
            content: $compile('<sn-auth></sn-auth>')($rootScope.$new())
          });
          LogService.error('Login error:', error);
        }
      );
    }

    function setUserProfile(userProfile){
      ConfirmationDialog.closeAll();
      self.userProfile = userProfile;
      EventsService.publish('sn-login', self.userProfile);
    }

    self.getUserProfile = getUserProfile;
    self.setUserProfile = setUserProfile;
  }

})();