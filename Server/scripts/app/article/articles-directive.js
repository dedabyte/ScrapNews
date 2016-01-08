(function () {

    'use strict';

    var componentName = 'snArticles';

    angular
      .module('app')
      .directive(componentName, function (Server, EventsService) {
          return {
              controllerAs: componentName,
              controller: function ($scope) {
                  var self = this;

                  self.articles = [];                  

                  function getArticlesFromServer(publishers, categories) {
                      Server.q(dbq.articles(publishers, categories)).then(function (response) {
                          self.articles = response.data;
                      });
                  }
                  
                  function selectArticle(article){
                      self.articles.forEach(function(art){
                          art.selected = false;
                      });
                      article.selected = true;
                      EventsService.publish('sn-selectedArticle', article);
                  }

                  EventsService.subscribe('sn-filters', $scope, function (event, filters) {
                      getArticlesFromServer(filters.publishers, filters.categories);
                  });

                  function timestampToISO(ts) {
                      ts = ts + '';
                      var y, m, d, hh, mm;
                      y = parseInt(ts.substr(0, 4));
                      m = parseInt(ts.substr(4, 2)) - 1;
                      d = parseInt(ts.substr(6, 2));
                      hh = parseInt(ts.substr(8, 2));
                      mm = parseInt(ts.substr(10, 2));
                      return (new Date(y, m, d, hh, mm)).toISOString();
                  }

                  self.timestampToISO = timestampToISO;
                  self.selectArticle = selectArticle;

                  getArticlesFromServer();
              }
          };
      });

})();
