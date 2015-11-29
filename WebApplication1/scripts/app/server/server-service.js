(function () {

    'use strict';
    
    angular
        .module('app')
        .factory('ServerRest', function (Restangular) {
            return Restangular.withConfig(function (RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl('/');
            });
        });

    angular
        .module('app')
        .factory('WPRest', function (Restangular) {
            return Restangular.withConfig(function (RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl('http://www.nighttrainns.info/wp-json/wp/v2');
            });
        });


    angular
        .module('app')
        .service('Server', Server);

    function Server(ServerRest, WPRest) {

        this.q = function (query) {
            return ServerRest.one('query').get({ q: query });
        };

        this.wpimage = function(url){
            return  ServerRest.one('Home/GetImage')
                .withHttpConfig({ responseType: 'blob' })
                .get({ url: url })
                .then(function (response) {
                    var imageData = new FormData();
                    var filename = url.split('/').pop();
                    imageData.append('file', new File([response], filename));

                    return WPRest.one('media')
                        .post(null, imageData, null, {
                            'Authorization': 'Basic ' + btoa('test:test'),
                            'Content-Type': undefined
                        });
                });
        };

        this.wppost = function(postConfig){
            return WPRest.one('posts')
                .post(null, $.param(postConfig), null, {
                    'Authorization': 'Basic ' + btoa('test:test'),
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                });
        };
    }

})();