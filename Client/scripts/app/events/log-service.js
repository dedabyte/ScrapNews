(function(){

  'use strict';

  angular
    .module('app')
    .factory('LogService', LogService);

  function LogService(){

    function log(){
      var args = Array.prototype.slice.call(arguments);
      args.unshift('color:#00bcd4;font-weight:bold');
      args.unshift('%c~ ElvisLog: %s');
      console.log.apply(console, args);
    }

    function warn(){
      var args = Array.prototype.slice.call(arguments);
      args.unshift('color:orange;font-weight:bold');
      args.unshift('%c~ ElvisLog: %s');
      console.log.apply(console, args);
    }

    function error(){
      var args = Array.prototype.slice.call(arguments);
      args.unshift('color:red;font-weight:bold');
      args.unshift('%c~ ElvisLog: %s');
      console.log.apply(console, args);
    }

    return {
      log: log,
      warn: warn,
      error: error
    };

  }

})();
