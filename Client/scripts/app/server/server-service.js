(function(){

  'use strict';

  angular
    .module('app')
    .factory('ServerRest', function(Restangular){
      return Restangular.withConfig(function(RestangularConfigurer){
        RestangularConfigurer.setBaseUrl('http://localhost:54861/api');
        RestangularConfigurer.setDefaultHeaders({'SN-Auth': localStorage.getItem('sn-token')});
      });
    });

  //angular
  //    .module('app')
  //    .factory('WPRest', function (Restangular) {
  //        return Restangular.withConfig(function (RestangularConfigurer) {
  //            RestangularConfigurer.setBaseUrl('http://www.nighttrainns.info/wp-json/wp/v2');
  //        });
  //    });

  angular
    .module('app')
    .service('WPRest', function(Restangular){
      this.getRest = function(wpConfiguration){
        return Restangular.withConfig(function(RestangularConfigurer){
          RestangularConfigurer.setBaseUrl(wpConfiguration.wp_api);
        });
      };
    });

  angular
    .module('app')
    .service('Server', Server);

  function Server(ServerRest, WPRest){

    this.login = function(user, pass){
      return ServerRest.one('authenticate').post(null, {
        user: user,
        pass: pass
      });
    };

    this.q = function(query){
      return ServerRest.one('Query').get({ q: query });
    };

    this.publishers = function(){
      return ServerRest.one('Publishers').get();
    };

    this.categories = function(){
      return ServerRest.one('Categories').get();
    };

    this.userProfile = function(){
      return ServerRest.one('UserProfile').get();
    };

    this.setDisabledCategories = function(categories){
      return ServerRest.one('SetUserDisabledCategories').post(null, { categories: categories });
    };

    this.setWPs = function(jsonWPs){
      return ServerRest.one('SetUserWPs').post(null, { jsonWPs: jsonWPs });
    };

    this.wpimage = function(url, wpConfiguration){
      var wpRest = WPRest.getRest(wpConfiguration);
      return ServerRest.one('GetImage')
        .withHttpConfig({ responseType: 'blob' })
        .get({ url: url })
        .then(function(response){
          var imageData = new FormData();
          var filename = url.split('/').pop();
          imageData.append('file', new File([response], filename));

          return wpRest.one('media')
            .post(null, imageData, null, {
              'Authorization': wpConfiguration.wp_auth_token,
              'Content-Type': undefined
            });
        });
    };

    this.wppost = function(postConfig, wpConfiguration){
      var wpRest = WPRest.getRest(wpConfiguration);
      return wpRest.one('posts')
        .post(null, $.param(postConfig), null, {
          'Authorization': wpConfiguration.wp_auth_token,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        });
    };

    this.wpGetPosts = function(wpConfiguration){
      var wpRest = WPRest.getRest(wpConfiguration);
      return wpRest.one('posts').get();
    }
  }

})();