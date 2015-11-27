(function () {

    'use strict';

    var app = angular.module('app', ['restangular']);

    app.config(function (RestangularProvider) {
        RestangularProvider.setBaseUrl('/');
    });

    app.run(function (Restangular, ServerService) {
        ServerService.q(dbq.articles(['kurir'], ['stars', 'planeta'])).then(
            function (response) {
                console.log(response.plain());
            }, function (response) {
                console.log(response);
            });
    });

})();