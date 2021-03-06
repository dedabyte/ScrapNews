﻿(function(){

  'use strict';

  var componentName = 'snFilters';

  angular
    .module('scrapper')
    .directive(componentName, function(Server, EventsService, LogService, ConfirmationDialog){
      return {
        controllerAs: componentName,
        /** @ngInject */
        controller: function($scope){
          var self = this;
          // for cache
          var publishers = [];
          var categories = [];
          var selectedPublishers = [];
          // for view
          self.publishers = [];
          self.categories = [];
          self.disabledCategories = [];

          var dialogId;

          function getFiltersFromServer(){
            var showErrorDialog = function(what, error){
              ConfirmationDialog.openError('Could not get <b>' + what + '</b>. See console for more info.');
              LogService.error(error);
            };

            Server.publishers().then(
              function(response){
                response = response.plain();
                if(response.error){
                  showErrorDialog('publishers', response);
                }else{
                  self.publishers = response.data;
                  publishers = self.publishers;
                }
              },
              function(error){
                showErrorDialog('publishers', error);
              }
            );
            Server.categories().then(
              function(response){
                response = response.plain();
                if(response.error){
                  showErrorDialog('publishers', response);
                }else{
                  self.categories = response.data;
                  categories = self.categories;
                }
              },
              function(error){
                showErrorDialog('categories', error);
              }
            );
          }

          function changePublisher(filter, $event){
            if($event && $event.ctrlKey){
              filter.selected = !filter.selected;
            }else{
              self.publishers.forEach(function(item){
                item.selected = false;
              });
              filter.selected = true;
            }

            selectedPublishers = self.publishers.filter(function(pub){
              return pub.selected === true;
            });
            if(selectedPublishers.length){
              self.categories = categories.filter(function(cat){
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
            if($event && $event.ctrlKey){
              filter.selected = !filter.selected;
            }else{
              self.categories.forEach(function(item){
                item.selected = false;
              });
              filter.selected = true;
            }
            publishSelected();
          }

          function publishSelected(){
            var selCategories = self.categories.filter(function(item){
              return item.selected;
            }).map(function(item){
              return item.name;
            });

            var selPublishers = self.publishers.filter(function(item){
              return item.selected;
            }).map(function(item){
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
              hits += (cat[pub.name] || 0)  ;
            });
            return hits;
          }

          function isCategoryDisabled(cat){
            return self.disabledCategories.indexOf(cat.name) > -1;
          }

          EventsService.subscribe('sn-login', $scope, function(e, userProfile){
            self.disabledCategories = userProfile.disabled_categories.split('|');
            getFiltersFromServer();
          });


          /* FILTERS CONFIGURATION */

          function openConfigDialog(){
            self.categoriesForConfig = angular.copy(self.categories);
            self.categoriesForConfig.forEach(function(cat){
              cat.checked = !isCategoryDisabled(cat);
            });
            var template =
              '<p class="filters-config-p" ng-repeat="filter in snFilters.categoriesForConfig">' +
              '<label><input type="checkbox" ng-model="filter.checked">{{:: filter.name}} <small>({{:: filter.hits}})</small></label>' +
              '</p>';
            dialogId = ConfirmationDialog.open({
              title: 'Configure categories',
              template: {
                template: template,
                scope: $scope
              },
              width: 256,
              buttons: [
                {
                  label: 'Save',
                  callback: setDisabledCategories
                },
                { label: 'Cancel' }
              ]
            });
          }

          function setDisabledCategories(){
            var showErrorDialog = function(error){
              ConfirmationDialog.openError('Could not save <b>disabled categories</b>. See console for more info.');
              LogService.error(error);
            };

            var categories = self.categoriesForConfig.filter(function(cat){
              return cat.checked === false;
            }).map(function(cat){
              return cat.name
            }).join('|');
            Server.setDisabledCategories(categories).then(
              function(response){
                response = response.plain();
                if(response.error){
                  showErrorDialog(response);
                }else{
                  self.disabledCategories = categories;
                  ConfirmationDialog.close(dialogId);
                }
              },
              function(error){
                showErrorDialog(error);
              }
            );
          }

          self.changePublisher = changePublisher;
          self.changeCategory = changeCategory;
          self.isCategoryDisabled = isCategoryDisabled;
          self.getHitsForCategory = getHitsForCategory;
          self.openConfigDialog = openConfigDialog;
        }
      };
    });

})();
