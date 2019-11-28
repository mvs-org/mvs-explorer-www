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
        $scope.blocks_fully_loaded = false;

        $scope.load = function() {
            if(!$scope.loading_blocks && !$scope.blocks_fully_loaded) {
                $scope.loading_blocks = true;
                return MetaverseService.ListBlocks($scope.last_known)
                    .then((response) => {
                        $scope.blocks = $scope.blocks.concat(response.data.result);
                        if($scope.blocks[$scope.blocks.length-1])
                            $scope.last_known = $scope.blocks[$scope.blocks.length-1]._id;
                        $scope.loading_blocks = false;
                        if(response.data.result.length == 0)
                            $scope.blocks_fully_loaded = true;
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
        $scope.loading_confirmation = true;
        $scope.buttonCopyToClipboard = new ClipboardJS('.btn');

        $scope.loading_txs = false;
        $scope.last_known = '';
        $scope.limit = 20;
        $scope.txs = [];
        $scope.txs_fully_loaded = false;

        $scope.format = (value, decimals) => value / Math.pow(10, decimals);

        function init() {
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
                    .then(() => Promise.all([$scope.load(), getConfirmations()]))
            } else {
                $location.path('/');
            }
        }

        $scope.load = function() {
            if(!$scope.loading_txs && !$scope.txs_fully_loaded && $scope.block) {
                $scope.loading_txs = true;
                return MetaverseService.BlockTxs($scope.block.hash, $scope.last_known, $scope.limit)
                    .then((response) => {
                        $scope.txs = $scope.txs.concat(response.data.result);
                        if($scope.txs[$scope.txs.length-1])
                            $scope.last_known = $scope.txs[$scope.txs.length-1]._id;
                        $scope.loading_txs = false;
                        if(response.data.result.length < $scope.limit)
                            $scope.txs_fully_loaded = true;
                    })
                    .catch((error) => {
                        $scope.loading_txs = false;
                        console.error(error);
                    });
            }
        }

        function getConfirmations() {
            return MetaverseService.FetchHeight()
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                        $scope.height = response.data.result;
                        $scope.confirmations = $scope.height - $scope.block.number + 1;
                        $scope.loading_confirmation = false;
                    }
                });
        }

        init();
    }

})();
