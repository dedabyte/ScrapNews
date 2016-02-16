(function(){

  'use strict';

  angular
    .module('scrapper')
    .service('Auth', Auth);

  function Auth(Server, LogService, EventsService, ConfirmationDialog, $rootScope, $compile){
    var self = this;

    function getUserProfile(){
      ConfirmationDialog.closeAll();
      Server.userProfile().then(
        function(response){
          self.userProfile = response.data;
          convertWpUrlToApi();
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
      convertWpUrlToApi();
      EventsService.publish('sn-login', self.userProfile);
    }

    function convertWpUrlToApi(){
      self.userProfile.wps.forEach(function(wp){
        var url = wp.wp_url;
        if(url[url.length - 1] === '/'){
          wp.wp_api = url + 'wp-json/wp/v2';
        }else{
          wp.wp_api = url + '/wp-json/wp/v2';
        }
      });
    }

    self.getUserProfile = getUserProfile;
    self.setUserProfile = setUserProfile;
  }

})();