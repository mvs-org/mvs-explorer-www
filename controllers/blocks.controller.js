(function() {
    'use strict';

    angular
        .module('app')
        .controller('BlockController', BlockController)
        .controller('BlocksController', BlocksController);

    function BlocksController($scope, MetaverseService) {

        $scope.loading_blocks = false;
        $scope.last_known = '';
        $scope.blocks = [];

        $scope.load = function() {
            if(!$scope.loading_blocks) {
                $scope.loading_blocks = true;
                return MetaverseService.ListBlocks($scope.last_known)
                    .then((response) => {
                        $scope.blocks = $scope.blocks.concat(response.data.result);
                        $scope.last_known = $scope.blocks[$scope.blocks.length-1]._id;
                        $scope.loading_blocks = false;
                    })
                    .catch((error) => {
                        $scope.loading_blocks = false;
                        console.error(error);
                    });
            }
        }

    }

    function BlockController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope) {

        var number = $stateParams.number;
        $rootScope.nosplash = true;
        $scope.loading_block = true;
        $scope.loading_txs = true;
        $scope.loading_confirmation = true;
        $scope.items_per_page = 10;
        $scope.buttonCopyToClipboard = new ClipboardJS('.btn');

        $scope.switchPage = (page) => {
            $scope.current_page = page;
            return load();
        };

        $scope.applyFilters = () => {
            $scope.current_page = 1;
            return load();
        };

        $scope.format = (value, decimals) => value / Math.pow(10, decimals);

        var load = () => {
            if (number != undefined) {
                NProgress.start();
                MetaverseService.Block(number)
                    .then((response) => {
                        $scope.loading_block = false;
                        if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                            $scope.block = response.data.result;
                        } else {
                            $translate('MESSAGES.ERROR_BLOCK_NOT_FOUND')
                                .then((data) => {
                                    $location.path('/');
                                    FlashService.Error(data, true);
                                });
                        }
                        NProgress.done();
                    })
                    .then(() => MetaverseService.BlockTxs($scope.block.hash, $scope.current_page - 1, $scope.items_per_page))
                    .then((response) => {
                        $scope.loading_txs = false;
                        if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                            $scope.txs = response.data.result.result;
                            $scope.total_count = response.data.result.count;
                        } else {
                            $translate('MESSAGES.ERROR_BLOCK_TXS_NOT_FOUND')
                                .then((data) => {
                                    $location.path('/');
                                    FlashService.Error(data, true);
                                });
                        }
                    })
                    .then(() => MetaverseService.FetchHeight())
                    .then((response) => {
                        if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                            $scope.height = response.data.result;
                            $scope.confirmations = $scope.height - $scope.block.number + 1;
                            $scope.loading_confirmation = false;
                        }
                    });
              }
        }

        $scope.switchPage(1);
    }

})();
