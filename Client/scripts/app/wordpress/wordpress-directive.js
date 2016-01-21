(function(){

  'use strict';

  var componentName = 'snWpPost';

  angular
    .module('app')
    .directive(componentName, function(Server, EventsService){
      //var $content = $('#_content');

      return {
        controllerAs: componentName,
        controller: function($scope){
          var self = this;

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

          EventsService.subscribe('sn-login', $scope, function(e, userProfile){
            self.wps = userProfile.wps;
          });

          self.post = post;
        }
      };
    });

})();
