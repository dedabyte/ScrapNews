﻿(function(){

  'use strict';

  var componentName = 'snPreview';

  angular
    .module('scrapper')
    .directive(componentName, function(EventsService, $sce){
      return {
        controllerAs: componentName,
        /** @ngInject */
        controller: function($scope){
          var self = this;

          self.article = null;

          EventsService.subscribe('sn-filters', $scope, function(){
            clearEmbeds();
            self.article = null;
          });

          EventsService.subscribe('sn-selectedArticle', $scope, function(evemt, article){
            clearEmbeds();
            article.contentHtml = $sce.trustAsHtml(article.content);
            self.article = article;
          });

          function timestampToReadable(ts){
            ts = ts + '';
            var y, m, d, hh, mm;
            y = ts.substr(0, 4);
            m = ts.substr(4, 2);
            d = ts.substr(6, 2);
            hh = ts.substr(8, 2);
            mm = ts.substr(10, 2);
            return d + '.' + m + '.' + y + '.  ' + hh + ':' + mm;
          }

          function clearEmbeds(){
            window.instgrm = undefined;
          }

          self.timestampToReadable = timestampToReadable;
        }
      };
    });

})();
