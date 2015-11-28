(function () {

    'use strict';

    var componentName = 'snFilters';

    angular
      .module('app')
      .directive(componentName, function (Server, EventsService) {
          return {
              controllerAs: componentName,
              controller: function () {
                  var self = this;

                  self.publishers = [];
                  self.categories = [];

                  function getFiltersFromServer() {
                      Server.q(dbq.allPublishers()).then(function (response) {
                          self.publishers = response.plain();
                      });
                      Server.q(dbq.allCategories()).then(function (response) {
                          self.categories = response.plain();
                      });
                  }

                  function changeFilter(filter, $event, modelName) {
                      if($event && $event.ctrlKey){
                          filter.selected = !filter.selected;
                      } else{
                          self[modelName].forEach(function (item) {
                              item.selected = false;
                          });
                          filter.selected = true;
                      }

                      var selectedCategories = self.categories.filter(function (item) {
                          return item.selected;
                      }).map(function (item) {
                          return item.name;
                      });

                      var selectedPublishers = self.publishers.filter(function (item) {
                          return item.selected;
                      }).map(function (item) {
                          return item.name;
                      });

                      EventsService.publish('sn-filters', { publishers: selectedPublishers, categories: selectedCategories });
                  }

                  self.changeFilter = changeFilter;

                  getFiltersFromServer();
              }
          };
      });

})();
