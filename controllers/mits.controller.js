(function() {
    'use strict';

    angular
        .module('app')
        .controller('MitsController', MitsController)
        .controller('MitController', MitController);

    function MitsController($scope, MetaverseService) {

        $scope.loading_mits = false;
        $scope.last_known = '';
        $scope.mits = [];
        $scope.mits_fully_loaded = false;
        $scope.loading_count = true;

        $scope.load = function() {
            if(!$scope.loading_mits && !$scope.mits_fully_loaded) {
                $scope.loading_mits = true;
                return MetaverseService.ListMits($scope.last_known)
                    .then((response) => {
                        $scope.mits = $scope.mits.concat(response.data.result);
                        $scope.last_known = $scope.mits[$scope.mits.length-1]._id;
                        $scope.loading_mits = false;
                        if(response.data.result.length == 0)
                            $scope.mits_fully_loaded = true;
                    })
                    .catch((error) => {
                        $scope.loading_mits = false;
                        console.error(error);
                    });
            }
        }

        MetaverseService.MitsCount()
            .then((response) => {
                $scope.count = response.data.result.count;
                $scope.loading_count = false;
                console.log($scope.count)
            })
            .catch((error) => {
                $scope.loading_count = false;
                console.error(error);
            });

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
