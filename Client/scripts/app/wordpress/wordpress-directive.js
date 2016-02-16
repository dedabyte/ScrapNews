(function(){

  'use strict';

  var componentName = 'snWpPost';

  angular
    .module('scrapper')
    .directive(componentName, function(Server, EventsService, ConfirmationDialog, LogService){
      //var $content = $('#_content');

      return {
        controllerAs: componentName,
        controller: function($scope){
          var self = this;

          var dialogId;

          self.article = null;
          self.selectedWP = null;

          EventsService.subscribe('sn-filters', $scope, function(){
            self.article = null;
          });

          EventsService.subscribe('sn-selectedArticle', $scope, function(event, article){
            self.article = article;
          });

          function selectWP(wp){
            self.selectedWP = wp;
            self.selectedWP.postData = self.selectedWP.postData || { status: 100 };
            if(wp.postData.status > 2){
              wp.postData.status = 100;
            }
            getPostsForSelectedWP(wp);
          }

          function getPostsForSelectedWP(wp){
            if(angular.isUndefined(wp)){
              wp = self.selectedWP;
            }
            wp.postData.posts = undefined;
            Server.wpGetPosts(wp).then(
              function(response){
                response = response.plain();
                response.forEach(function(post){
                  delete post._links;
                });
                wp.postData.posts = response;
              },
              function(error){
                LogService.error(error);
                ConfirmationDialog.openError('Error while getting WP data for <b>' + wp.wp_name + '</b>. See console for more info.');
                self.selectedWP = null;
              }
            )
          }

          function displayPostingStatus(){
            var postingStatuses = {
              '100': '',
              '1': 'Uploading image...',
              '2': 'Posting...',
              '3': 'Success!'
            };
            if(!self.selectedWP || !self.selectedWP.postData || !postingStatuses.hasOwnProperty(self.selectedWP.postData.status)){
              return '';
            }
            return postingStatuses[self.selectedWP.postData.status];
          }

          function post(){
            var wpConfig = self.selectedWP;
            wpConfig.postData.status = 1;
            Server
              .wpImage(self.article.image_original_url || self.article.image_rss_original_url, wpConfig)
              .then(
                // wpImage OK
                function(image){
                  wpConfig.postData.status = 2;
                  var postConfig = {
                    title: self.article.title,
                    status: 'publish',
                    content: createContent(image, self.article),
                    featured_image: image.id
                  };
                  Server.wpPost(postConfig, wpConfig).
                    then(
                      // wpPost OK
                      function(response){
                        if(response.id){
                          wpConfig.postData.status = 3;
                        }
                        if(wpConfig === self.selectedWP){
                          getPostsForSelectedWP();
                        }
                      },
                      // wpPost ERROR
                      function(error){
                        wpConfig.postData.status = 100;
                        LogService.error(error);
                        ConfirmationDialog.openError('Could not create post in <b>' + wpConfig.wp_name + '</b>. See console for more info.');
                      }
                    );
                },
                // wpImage ERROR
                function(error){
                  wpConfig.postData.status = 100;
                  LogService.error(error);
                  ConfirmationDialog.openError('Could not upload feature image to <b>' + wpConfig.wp_name + '</b>. See console for more info.');
                }
              );
          }

          function createContent(image, article){
            var $content = $('<div><p></p><p></p><p></p></div>');
            var $contentParagraphs = $content.find('p');

            $contentParagraphs.eq(0).html('<b>' + article.summary + '</b>');
            $contentParagraphs.eq(1).html('<img src="' + image.source_url + '"/>');
            $contentParagraphs.eq(2).html(article.content);

            return $content.html();
          }

          EventsService.subscribe('sn-login', $scope, function(e, userProfile){
            self.wps = userProfile.wps;
          });



          /* WP CONFIGURATION */

          function openConfigDialog(){
            self.configWps = angular.copy(self.wps);
            var template =
              '<p class="wp-config-p" ng-repeat="wp in snWpPost.configWps">' +
              '{{ $index+1}}) <input type="text" placeholder="WP name" class="wp-config-inp-name" ng-model="wp.wp_name"/>' +
              ' <input type="text" placeholder="WP url" class="wp-config-inp-url" ng-model="wp.wp_url"/>' +
              ' <select class="wp-config-sel-type" ng-model="wp.wp_auth_type">' +
              '  <option value="basic">basic</option>' +
              '  <option value="token">token</option>' +
              ' </select>' +
              ' <input type="text" placeholder="WP auth" class="wp-config-inp-token" ng-model="wp.wp_auth_token"/>' +
              ' <span class="wp-config-x" ng-click="snWpPost.removeConfigWp($index)">&times;</span>' +
              '</p>' +
              '<button ng-click="snWpPost.addEmptyConfigWp()">Add new</button>';
            dialogId = ConfirmationDialog.open({
              title: 'Configure WPs',
              template: {
                template: template,
                scope: $scope
              },
              width: 900,
              buttons: [
                {
                  label: 'Save',
                  callback: setWps
                },
                { label: 'Cancel' }
              ]
            })
          }

          function setWps(){
            var showErrorDialog = function(){
              ConfirmationDialog.openError('Could not save <b>wordpress configuration</b>. See console for more info.');
            };

            var configWps = self.configWps.filter(function(wp){
              return (wp.wp_name && wp.wp_url && wp.wp_auth_type && wp.wp_auth_token);
            });
            Server.setWPs(angular.toJson(configWps)).then(
              function(response){
                response = response.plain();
                if(response.data.error){
                  showErrorDialog();
                }else{
                  self.wps = configWps;
                  convertWpUrlToApi();
                  ConfirmationDialog.close(dialogId);
                }
              },
              function(response){
                showErrorDialog();
                LogService.error(response);
              }
            );
          }

          function addEmptyConfigWp(){
            self.configWps.push({
              wp_name: '',
              wp_url: '',
              wp_auth_type: 'basic',
              wp_auth_token: ''
            });
          }

          function removeConfigWp(index){
            self.configWps.splice(index, 1);
          }

          function convertWpUrlToApi(){
            self.wps.forEach(function(wp){
              var url = wp.wp_url;
              if(url[url.length - 1] === '/'){
                wp.wp_api = url + 'wp-json/wp/v2';
              }else{
                wp.wp_api = url + '/wp-json/wp/v2';
              }
            });
          }

          self.post = post;
          self.displayPostingStatus = displayPostingStatus;
          self.selectWP = selectWP;

          self.openConfigDialog = openConfigDialog;
          self.addEmptyConfigWp = addEmptyConfigWp;
          self.removeConfigWp = removeConfigWp;
        }
      };
    });

})();
