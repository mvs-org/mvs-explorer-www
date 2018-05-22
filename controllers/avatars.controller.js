(function() {
    'use strict';

    angular
        .module('app')
        .controller('AvatarController', AvatarController)
        .controller('AvatarsController', AvatarsController);

    function AvatarController($scope, MetaverseService, $stateParams) {

        $scope.loading = true;
        MetaverseService.FetchAvatar($stateParams.symbol)
            .then((response) => {
                $scope.avatar = response.data.result;
                $scope.loading = false;
            })
            .catch((error) => {
                $scope.loading = false;
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

        $scope.loading = true;
        MetaverseService.ListAvatars()
            .then((response) => {
                $scope.avatars = response.data.result;
                $scope.total_count = response.data.result.count;
                $scope.loading = false;
            })
            .catch((error) => {
                $scope.loading = false;
                console.error(error);
            });

    }

})();
