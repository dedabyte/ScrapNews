(function () {

    'use strict';

    var app = angular.module('app', ['restangular']);

    app.run(function () {
        $.timeago.settings.refreshMillis = 0;
    });

})();