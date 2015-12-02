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
                  // for cache
                  var publishers = [];
                  var categories = [];
                  var selectedPublishers = [];
                  // for view
                  self.publishers = [];
                  self.categories = [];

                  function getFiltersFromServer() {
                      Server.publishers().then(function (response) {
                          self.publishers = response.data;
                          publishers = self.publishers;
                      });
                      Server.categories().then(function (response) {
                          self.categories = response.data;
                          categories = self.categories;
                      });
                  }
                  
                  function changePublisher(filter, $event) {
                      if ($event && $event.ctrlKey) {
                          filter.selected = !filter.selected;
                      } else {
                          self.publishers.forEach(function (item) {
                              item.selected = false;
                          });
                          filter.selected = true;
                      }

                      selectedPublishers = self.publishers.filter(function(pub){
                          return pub.selected === true;
                      });
                      if (selectedPublishers.length) {
                          self.categories = categories.filter(function (cat) {
                              var hit = false;
                              selectedPublishers.forEach(function(pub){
                                  if(cat.hasOwnProperty(pub.name)){
                                      hit = true;
                                  }
                              });
                              return hit;
                          });
                      }else{
                          self.categories = categories;
                      }
                      publishSelected();
                  }
                  
                  function changeCategory(filter, $event){
                      if ($event && $event.ctrlKey) {
                          filter.selected = !filter.selected;
                      } else {
                          self.categories.forEach(function (item) {
                              item.selected = false;
                          });
                          filter.selected = true;
                      }
                      publishSelected();
                  }

                  function publishSelected(){
                      var selCategories = self.categories.filter(function (item) {
                          return item.selected;
                      }).map(function (item) {
                          return item.name;
                      });

                      var selPublishers = self.publishers.filter(function (item) {
                          return item.selected;
                      }).map(function (item) {
                          return item.name;
                      });

                      EventsService.publish('sn-filters', { publishers: selPublishers, categories: selCategories });
                  }
                  
                  function getHitsForCategory(cat){
                      if(!selectedPublishers.length){
                          return cat.hits;
                      }
                      var hits = 0;
                      selectedPublishers.forEach(function(pub){
                          hits += cat[pub.name];
                      });
                      return hits;
                  }

                  self.changePublisher = changePublisher;
                  self.changeCategory = changeCategory;
                  self.getHitsForCategory = getHitsForCategory;

                  getFiltersFromServer();
              }
          };
      });

})();
