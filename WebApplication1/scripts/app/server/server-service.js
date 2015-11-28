(function () {

    'use strict';

    angular
        .module('app')
        .service('Server', Server);

    function Server(Restangular) {
        this.q = function(query){
            return Restangular.one('query').get({ q: query });
        };
    }

})();