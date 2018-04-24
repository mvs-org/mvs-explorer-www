(function () {
    'use strict';

    angular
        .module('app')
        .factory('Assets', Assets);

    //Assets.$inject = [];
    function Assets() {
        var service = {};

        service.hasIcon = ['ETP', 'MVS.ZGC', 'MVS.ZDC', 'CSD', 'PARCELX.GPX', 'PARCELX.TEST', 'SDG', 'META', 'MVS.HUG'];

        setPriority();

        function setPriority() {
            service.priority = [];
            service.priority["ETP"] = 1;
            service.priority["MVS.ZGC"] = 10;
            service.priority["MVS.ZDC"] = 20;
            service.priority["CSD"] = 100;
            service.priority["PARCELX.GPX"] = 100;
        };

        setPriority();


        return service;

    }

})();
