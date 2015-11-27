(function () {

    'use strict';

    angular
        .module('app')
        .service('ServerService', ServerService);

    function ServerService(Restangular) {
        this.q = function (query) {
            return Restangular.one('q').get({ q: query });
        }
    }

})();