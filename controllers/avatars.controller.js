(function() {
    'use strict';

    angular
        .module('app')
        .controller('AvatarController', AvatarController)
        .controller('AvatarsController', AvatarsController);

    function AvatarController($scope, MetaverseService, $stateParams) {

        $scope.loading_avatars = true;
        $scope.showAddressesHistory = false;
        $scope.certs = [];
        MetaverseService.FetchAvatar($stateParams.symbol)
            .then((response) => {
                $scope.avatar = response.data.result;
                $scope.loading_avatars = false;
            })
            .catch((error) => {
                $scope.loading_avatars = false;
                console.error(error);
            });

        $scope.loading_certs = true;
        MetaverseService.FetchCerts($stateParams.symbol)
            .then((response) => {
                $scope.certs = response.data.result;
                $scope.loading_certs = false;
            })
            .catch((error) => {
                $scope.loading_certs = false;
                console.error(error);
            });

    }

    function AvatarsController($scope, MetaverseService) {

        $scope.loading_avatars = true;
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
            $scope.loading_avatars = true;
            return MetaverseService.ListAvatars($scope.current_page - 1, $scope.items_per_page)
                .then((response) => {
                    $scope.avatars = response.data.result.result;
                    $scope.total_count = response.data.result.count;
                    $scope.loading_avatars = false;
                })
                .catch((error) => {
                    $scope.loading_avatars = false;
                    console.error(error);
                });
        };

        $scope.switchPage(1);

    }



})();
