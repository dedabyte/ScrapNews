(function () {

    'use strict';

    var componentName = 'snFilters';

    angular
      .module('app')
      .directive(componentName, function (ServerService, EventsService) {
          return {
              controllerAs: componentName,
              controller: function () {
                  var self = this;

                  self.publishers = [];
                  self.categories = [];

                  function getFiltersFromServer() {
                      ServerService.q(dbq.allPublishers()).then(function (response) {
                          self.publishers = response.plain();
                      });
                      ServerService.q(dbq.allCategories()).then(function (response) {
                          self.categories = response.plain();
                      });
                  }

                  function filtersChanged($event, $index, filterName) {
                      var selectedCategories = self.categories.filter(function (item) {
                          return item._selected;
                      }).map(function (item) {
                          return item.name;
                      });

                      var selectedPublishers = self.publishers.filter(function (item) {
                          return item._selected;
                      }).map(function (item) {
                          return item.name;
                      });

                      EventsService.publish('sn-filters', { publishers: selectedPublishers, categories: selectedCategories });
                  }

                  self.filtersChanged = filtersChanged;

                  getFiltersFromServer();
              }
          };
      });

})();
