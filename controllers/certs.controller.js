(function() {
    'use strict';

    angular
        .module('app')
        .controller('CertsController', CertsController);


    function CertsController($scope, MetaverseService) {

        $scope.loading_certs = false;
        $scope.last_known = '';
        $scope.certs = [];
        $scope.certs_fully_loaded = false;
        $scope.loading_count = true;

        $scope.load = function() {
            if(!$scope.loading_certs && !$scope.certs_fully_loaded) {
                $scope.loading_certs = true;
                return MetaverseService.ListCerts($scope.last_known)
                    .then((response) => {
                        $scope.certs = $scope.certs.concat(response.data.result);
                        $scope.last_known = $scope.certs[$scope.certs.length-1]._id;
                        $scope.loading_certs = false;
                        if(response.data.result.length == 0)
                            $scope.certs_fully_loaded = true;
                    })
                    .catch((error) => {
                        $scope.loading_certs = false;
                        console.error(error);
                    });
            }
        }

        MetaverseService.CertsCount()
            .then((response) => {
                $scope.count = response.data.result.count;
                $scope.loading_count = false;
            })
            .catch((error) => {
                $scope.loading_count = false;
                console.error(error);
            });

    }

})();
