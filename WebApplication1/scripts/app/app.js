(function () {

    'use strict';

    var app = angular.module('app', ['restangular']);

    app.config(function (RestangularProvider) {
        RestangularProvider.setBaseUrl('/');
    });

    app.run(function () {

    });

})();