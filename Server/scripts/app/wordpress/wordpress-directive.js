(function () {

    'use strict';

    var componentName = 'snWpPost';

    angular
      .module('app')
      .directive(componentName, function (Server, EventsService) {
          var $content = $('#_content');

          return {
              controllerAs: componentName,
              controller: function ($scope) {
                  var self = this;

                  self.article = null;

                  EventsService.subscribe('sn-filters', $scope, function () {
                      self.article = null;
                  });

                  EventsService.subscribe('sn-selectedArticle', $scope, function (event, article) {
                      self.article = article;
                  });

                  function post() {
                      Server
                          .wpimage(self.article.image_original_url || self.article.image_rss_original_url)
                          .then(function (image) {
                              var content = $content.clone();
                              content.find('#_featuredImage').attr('src', image.source_url);
                              var postConfig = {
                                  title: self.article.title,
                                  status: 'publish',
                                  content: content.html(),
                                  //featured_image: image.id // TODO vratiti ovo kad vidimo zasto brlja
                              };
                              Server.wppost(postConfig).
                                  then(function (response) {
                                      if(response.id){
                                          console.log(response.plain());
                                          alert('Post successful with ID: ' + response.id);
                                      }
                                  });
                          });
                  }

                  self.post = post;
              }
          };
      });

})();
