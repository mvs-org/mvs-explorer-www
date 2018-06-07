(function() {
    'use strict';

    angular
        .module('app')
        .controller('MitsController', MitsController)
        .controller('MitController', MitController);

    function MitsController($scope, MetaverseService) {

        $scope.loading_mits = true;
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
            $scope.loading_mits = true;
            return MetaverseService.ListMits($scope.current_page - 1, $scope.items_per_page)
                .then((response) => {
                    $scope.mits = response.data.result.result;
                    $scope.total_count = response.data.result.count;
                    $scope.loading_mits = false;
                })
                .catch((error) => {
                    $scope.loading_mits = false;
                    console.error(error);
                });
        };

        $scope.switchPage(1);

    }


    function MitController($scope, MetaverseService, $stateParams) {

        $scope.loading_mit = true;
        $scope.previous_tx = [];

        MetaverseService.FetchMit($stateParams.symbol, 1)
            .then((response) => {
                $scope.mits = response.data.result;
                $scope.loading_mit = false;
                $scope.mits.forEach(function(mit) {
                    $scope.previous_tx[mit.spent_tx] = mit;
                    if(mit.attachment.status == 'registered') {
                        $scope.initial_mit = mit;
                    }
                    if(mit.spent_tx == 0) {
                        $scope.last_transfer = mit;
                    }

                });
            })
            .catch((error) => {
                $scope.loading_mit = false;
                console.error(error);
            });

    }

})();
