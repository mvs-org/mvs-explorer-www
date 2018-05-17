(function() {
    'use strict';

    angular
        .module('app')
        .controller('AvatarsController', AvatarsController);

    function AvatarsController($scope, MetaverseService) {

        $scope.loading = true;
        return MetaverseService.ListAvatars()
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
