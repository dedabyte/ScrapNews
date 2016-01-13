(function(){

  'use strict';

  angular
    .module('app')
    .directive('snTimeago', snTimeago);

  /**
   * required: elvis-timeago="ISO date [string]" - init directive with date
   * optional: data-refresh="seconds [number]" - indicate auto refresh with time in seconds (default 60 sec)
   */

  function snTimeago(){
    return {
      link: function(scope, element, attrs){
        // interval keeper
        var refreshInterval = null;
        // flag for set refresh interval
        var isRefresh = attrs.hasOwnProperty('refresh');
        // seconds for refresh interval
        var refreshSeconds = parseInt(attrs.refresh);
        // if not number or not provided > defaults to 60 sec
        if(isNaN(refreshSeconds)){
          refreshSeconds = 60;
        }
        // date object for calculations
        var date = new Date(attrs.snTimeago);

        // if refresh, set interval and attach scope $destroy listener to clear that interval on directive removal
        if(isRefresh){
          refreshInterval = setInterval(writeTime, refreshSeconds * 1000);
          scope.$on('$destroy', stopInterval);
        }

        // writes value to dom
        function writeTime(){
          element.text($.timeago(date));
        }

        // stops interval and clears variable
        function stopInterval(){
          clearInterval(refreshInterval);
          refreshInterval = null;
        }

        // init
        writeTime();
      }
    };
  }

})();
