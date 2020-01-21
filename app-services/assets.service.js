(function () {
    'use strict';

    angular
        .module('app')
        .factory('Assets', Assets);

    //Assets.$inject = [];
    function Assets() {
        var service = {};

        service.hasIcon = ['ETP', 'MVS.ZGC', 'MVS.ZDC', 'CSD.CSD', 'PARCELX.GPX', 'PARCELX.TEST', 'SDG', 'META', 'MVS.HUG', 'RIGHTBTC.RT', 'TIPLR.TPC', 'PANDO', 'VALOTY', 'KOALA.KT', 'DNA', 'GKC', 'DAY'];

        setPriority();

        function setPriority() {
            service.priority = [];
            service.priority["ETP"] = 1;
            service.priority["DNA"] = 10;
            service.priority["MVS.ZGC"] = 100;
            service.priority["MVS.ZDC"] = 110;
        };

        setPriority();


        return service;

    }

})();
