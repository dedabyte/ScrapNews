(function(){

  'use strict';

  var componentName = 'snWpPost';

  angular
    .module('app')
    .directive(componentName, function(Server, EventsService, ConfirmationDialog){
      //var $content = $('#_content');

      return {
        controllerAs: componentName,
        controller: function($scope){
          var self = this;

          var dialogId;

          self.article = null;

          EventsService.subscribe('sn-filters', $scope, function(){
            self.article = null;
          });

          EventsService.subscribe('sn-selectedArticle', $scope, function(event, article){
            self.article = article;
          });

          function post(wpConfig){
            Server
              .wpimage(self.article.image_original_url || self.article.image_rss_original_url, wpConfig)
              .then(function(image){
                var postConfig = {
                  title: self.article.title,
                  status: 'publish',
                  content: createContent(image, self.article),
                  featured_image: image.id
                };
                Server.wppost(postConfig, wpConfig).
                  then(function(response){
                    if(response.id){
                      console.log(response.plain());
                      alert('Post successful with ID: ' + response.id);
                    }
                  });
              });
          }

          function createContent(image, article){
            var $content = $('<div><p></p><p></p><p></p></div>');
            var $contentParagraphs = $content.find('p');

            $contentParagraphs.eq(0).html('<b>' + article.summary + '</b>');
            $contentParagraphs.eq(1).html('<img src="' + image.source_url + '"/>');
            $contentParagraphs.eq(2).html(article.content);

            return $content.html();
          }

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
            var configWps = self.configWps.filter(function(wp){
              return (wp.wp_name && wp.wp_url && wp.wp_auth_type && wp.wp_auth_token);
            });
            console.log(configWps);
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

          EventsService.subscribe('sn-login', $scope, function(e, userProfile){
            self.wps = userProfile.wps;
          });

          self.post = post;
          self.openConfigDialog = openConfigDialog;
          self.addEmptyConfigWp = addEmptyConfigWp;
          self.removeConfigWp = removeConfigWp;
        }
      };
    });

})();
