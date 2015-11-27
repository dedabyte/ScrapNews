(function () {

    'use strict';

    var componentName = 'snArticles';

    angular
      .module('app')
      .directive(componentName, function (ServerService, EventsService) {
          return {
              controllerAs: componentName,
              controller: function ($scope) {
                  var self = this;

                  self.articles = [];                  

                  function getArticlesFromServer(publishers, categories) {
                      ServerService.q(dbq.articles(publishers, categories)).then(function (response) {
                          self.articles = response.plain();
                      });
                  }

                  EventsService.subscribe('sn-filters', $scope, function (event, filters) {
                      getArticlesFromServer(filters.publishers, filters.categories);
                  });

                  getArticlesFromServer();
              }
          };
      });

})();
