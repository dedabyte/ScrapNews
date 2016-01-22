(function () {

    'use strict';
    
    angular
        .module('app')
        .factory('ServerRest', function (Restangular) {
            return Restangular.withConfig(function (RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl('/api');
            });
        });

    //angular
    //    .module('app')
    //    .factory('WPRest', function (Restangular) {
    //        return Restangular.withConfig(function (RestangularConfigurer) {
    //            RestangularConfigurer.setBaseUrl('http://www.nighttrainns.info/wp-json/wp/v2');
    //        });
    //    });

    angular
        .module('app')
        .service('WPRest', function (Restangular) {
            this.getRest = function (wpConfiguration) {
                return Restangular.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.setBaseUrl(wpConfiguration.wp_url);
                });
            };            
        });


    angular
        .module('app')
        .service('Server', Server);

    function Server(ServerRest, WPRest) {

        this.q = function (query) {
            return ServerRest.one('query').get({ q: query });
        };

        this.publishers = function () {
            return ServerRest.one('publishers').get();
        };

        this.categories = function () {
            return ServerRest.one('categories').get();
        };

        this.userProfile = function () {
            return ServerRest.one('userprofile').get();
        };



        this.wpimage = function (url, wpConfiguration) {
            var wpRest = WPRest.getRest(wpConfiguration);
            return ServerRest.one('getimage')
                .withHttpConfig({ responseType: 'blob' })
                .get({ url: url })
                .then(function (response) {
                    var imageData = new FormData();
                    var filename = url.split('/').pop();
                    imageData.append('file', new File([response], filename));

                    return wpRest.one('media')
                        .post(null, imageData, null, {
                            'Authorization': wpConfiguration.wp_auth_token,
                            'Content-Type': undefined
                        });
                });
        };

        this.wppost = function (postConfig, wpConfiguration) {
            var wpRest = WPRest.getRest(wpConfiguration);
            return wpRest.one('posts')
                .post(null, $.param(postConfig), null, {
                    'Authorization': wpConfiguration.wp_auth_token,
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                });
        };
    }

})();