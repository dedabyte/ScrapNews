(function () {

    'use strict';

    var app = angular.module('app', ['restangular']);

    app.run(function (ServerRest, WPRest) {
        //var url = 'http://images3.kurir.rs/slika-724x489/protest-u-istambulu-foto-reuters-1448732913-793505.jpg';
        //var filename = url.split('/').pop();

        //var p = ServerRest.one('Home/GetImage')
        //    .withHttpConfig({ responseType: 'blob' })
        //    .get({ url: url })
        //    .then(function(response){
        //        var imageData = new FormData();
        //        imageData.append('file', new File([response], filename));

        //        return WPRest.one('media')
        //            .post(null, imageData, null, {
        //                'Authorization': 'Basic ' + btoa('test:test'),
        //                'Content-Type': undefined
        //            });
        //    });
        
        //p.then(function (response){
        //    console.log(response.plain());
        //});
    });

})();