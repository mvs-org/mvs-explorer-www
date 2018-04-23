(function () {
    'use strict';

    angular
        .module('app')
        .factory('Assets', Assets);

    Assets.$inject = [];
    function Assets() {
        var service = {};

        service.hasIcon = ['ETP', 'MVS.ZGC', 'MVS.ZDC', 'CSD', 'PARCELX.GPX', 'PARCELX.TEST', 'SDG', 'META', 'MVS.HUG'];



        return service;

    }

})();
