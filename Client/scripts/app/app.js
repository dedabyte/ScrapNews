(function(){

  'use strict';

  var app = angular.module('scrapper', ['restangular']);

  app.config(function(RestangularProvider){

  });

  app.run(function(Auth){
    Auth.getUserProfile();
    $.timeago.settings.refreshMillis = 0;
  });

})();