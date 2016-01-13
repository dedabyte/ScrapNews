(function(){

  'use strict';

  var app = angular.module('app', ['restangular']);

  app.config(function(RestangularProvider){

  });

  app.run(function(Auth){
    Auth.getUserProfile();
    $.timeago.settings.refreshMillis = 0;
  });

})();