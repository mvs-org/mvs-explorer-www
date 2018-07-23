(function () {
    'use strict';

    angular
        .module('app')
        .factory('Assets', Assets);

    //Assets.$inject = [];
    function Assets() {
        var service = {};

        service.hasIcon = ['ETP', 'MVS.ZGC', 'MVS.ZDC', 'CSD.CSD', 'PARCELX.GPX', 'PARCELX.TEST', 'SDG', 'META', 'MVS.HUG', 'RIGHTBTC.RT'];

        setPriority();

        function setPriority() {
            service.priority = [];
            service.priority["ETP"] = 1;
            service.priority["PARCELX.GPX"] = 10;
            service.priority["RIGHTBTC.RT"] = 20;
            service.priority["MVS.ZGC"] = 100;
            service.priority["MVS.ZDC"] = 110;
            service.priority["CSD.CSD"] = 200;
        };

        setPriority();


        return service;

    }

})();
