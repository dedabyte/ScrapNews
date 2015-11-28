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
                          self.articles = response.plain();
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

                  self.selectArticle = selectArticle;

                  getArticlesFromServer();
              }
          };
      });

})();
