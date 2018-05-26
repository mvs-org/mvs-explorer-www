(function() {
    'use strict';

    angular
        .module('app')
        .controller('CertsController', CertsController);


    function CertsController($scope, MetaverseService) {

        $scope.loading_certs = true;
        $scope.items_per_page = 50;

        $scope.switchPage = (page) => {
            $scope.current_page = page;
            return load();
        };

        $scope.applyFilters = () => {
            $scope.current_page = 1;
            return load();
        };

        var load = () => {
            $scope.loading_certs = true;
            return MetaverseService.ListCerts($scope.current_page - 1, $scope.items_per_page)
                .then((response) => {
                    $scope.certs = response.data.result.result;
                    $scope.total_count = response.data.result.count;
                    $scope.loading_certs = false;
                })
                .catch((error) => {
                    $scope.loading_certs = false;
                    console.error(error);
                });
        };

        $scope.switchPage(1);

    }

})();
